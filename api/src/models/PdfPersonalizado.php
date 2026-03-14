<?php
require_once __DIR__ . '/BaseModel.php';
require_once __DIR__ . '/../utils/FileUpload.php';

class PdfPersonalizado extends BaseModel {
    protected $table = 'pdf_personalizado';

    private $validStatuses = ['realizado', 'pagamento_confirmado', 'em_confeccao', 'entregue'];

    public function __construct($db) {
        parent::__construct($db);
    }

    public function criarPedido($data) {
        $now = date('Y-m-d H:i:s');

        $payload = [
            'module_id'          => (int)($data['module_id'] ?? 0),
            'user_id'            => isset($data['user_id']) ? (int)$data['user_id'] : null,
            'nome_solicitante'   => trim($data['nome_solicitante'] ?? ''),
            'descricao_alteracoes' => trim($data['descricao_alteracoes'] ?? ''),
            'anexo1_base64'      => null,
            'anexo1_nome'        => $data['anexo1_nome'] ?? null,
            'anexo2_base64'      => null,
            'anexo2_nome'        => $data['anexo2_nome'] ?? null,
            'anexo3_base64'      => null,
            'anexo3_nome'        => $data['anexo3_nome'] ?? null,
            'status'             => 'pagamento_confirmado',
            'preco_pago'         => (float)($data['preco_pago'] ?? 0),
            'desconto_aplicado'  => (float)($data['desconto_aplicado'] ?? 0),
            'realizado_at'       => $now,
            'pagamento_confirmado_at' => $now,
            'em_confeccao_at'    => null,
            'entregue_at'        => null,
            'created_at'         => $now,
            'updated_at'         => $now,
        ];

        if (empty($payload['nome_solicitante'])) {
            throw new Exception('Nome do solicitante é obrigatório');
        }
        if (empty($payload['descricao_alteracoes'])) {
            throw new Exception('Descrição das alterações é obrigatória');
        }

        foreach ($payload as $k => $v) {
            if ($v === '') $payload[$k] = null;
        }
        $payload['nome_solicitante'] = trim($data['nome_solicitante'] ?? '');
        $payload['descricao_alteracoes'] = trim($data['descricao_alteracoes'] ?? '');

        $id = parent::create($payload);

        // Salvar anexos em disco com nome padronizado
        for ($i = 1; $i <= 3; $i++) {
            $base64Key = "anexo{$i}_base64";
            $nomeKey = "anexo{$i}_nome";
            if (!empty($data[$base64Key])) {
                $originalName = $data[$nomeKey] ?? "anexo{$i}.pdf";
                $prefix = "pdfpers_{$id}_anexo{$i}";
                $savedName = FileUpload::saveBase64File($data[$base64Key], $originalName, $prefix);
                if ($savedName) {
                    // Atualizar o registro com o nome do arquivo salvo
                    $stmt = $this->db->prepare("UPDATE {$this->table} SET {$nomeKey} = ? WHERE id = ?");
                    $stmt->execute([$savedName, $id]);
                }
            }
        }

        return $id;
    }

    public function listarPedidos($userId = null, $status = null, $limit = 20, $offset = 0, $search = null) {
        $where = [];
        $params = [];

        if ($userId !== null) {
            $where[] = 'user_id = ?';
            $params[] = $userId;
        }
        if ($status !== null && in_array($status, $this->validStatuses)) {
            $where[] = 'status = ?';
            $params[] = $status;
        }
        if ($search) {
            $where[] = '(nome_solicitante LIKE ? OR descricao_alteracoes LIKE ?)';
            $params[] = '%' . $search . '%';
            $params[] = '%' . $search . '%';
        }

        $whereSql = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $query = "SELECT id, module_id, user_id, nome_solicitante, descricao_alteracoes, status,
                         preco_pago, desconto_aplicado,
                         anexo1_nome, anexo2_nome, anexo3_nome,
                         pdf_entrega_nome,
                         realizado_at, pagamento_confirmado_at, em_confeccao_at, entregue_at,
                         created_at, updated_at
                  FROM {$this->table} {$whereSql}
                  ORDER BY id DESC LIMIT ? OFFSET ?";

        $params[] = (int)$limit;
        $params[] = (int)$offset;

        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function contarPedidos($userId = null, $status = null, $search = null) {
        $where = [];
        $params = [];

        if ($userId !== null) {
            $where[] = 'user_id = ?';
            $params[] = $userId;
        }
        if ($status !== null && in_array($status, $this->validStatuses)) {
            $where[] = 'status = ?';
            $params[] = $status;
        }
        if ($search) {
            $where[] = '(nome_solicitante LIKE ? OR descricao_alteracoes LIKE ?)';
            $params[] = '%' . $search . '%';
            $params[] = '%' . $search . '%';
        }

        $whereSql = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        $query = "SELECT COUNT(*) as count FROM {$this->table} {$whereSql}";
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($row['count'] ?? 0);
    }

    public function obterPedido($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function atualizarStatus($id, $status, $extraData = []) {
        if (!in_array($status, $this->validStatuses)) {
            throw new Exception('Status inválido: ' . $status);
        }

        $now = date('Y-m-d H:i:s');
        $sets = ['status = ?', 'updated_at = ?'];
        $params = [$status, $now];

        $timestampCol = $status . '_at';
        $sets[] = "$timestampCol = ?";
        $params[] = $now;

        $stmtCurrent = $this->db->prepare("SELECT pdf_entrega_nome FROM {$this->table} WHERE id = ?");
        $stmtCurrent->execute([(int)$id]);
        $current = $stmtCurrent->fetch(PDO::FETCH_ASSOC);
        $currentPdf = $current['pdf_entrega_nome'] ?? null;

        $shouldRemovePdf = !empty($extraData['remove_pdf']);

        if ($shouldRemovePdf) {
            if (!empty($currentPdf)) {
                FileUpload::deleteDeliveryFile($currentPdf);
            }
            $sets[] = 'pdf_entrega_nome = NULL';
            $sets[] = 'pdf_entrega_base64 = NULL';
            $sets[] = 'entregue_at = NULL';
        } elseif (isset($extraData['pdf_entrega_base64'])) {
            if (!empty($currentPdf)) {
                FileUpload::deleteDeliveryFile($currentPdf);
            }

            $pdfNome = $extraData['pdf_entrega_nome'] ?? 'entrega.pdf';
            $prefix = "pdfpers_{$id}_entrega";
            $savedName = FileUpload::saveDeliveryPdf($extraData['pdf_entrega_base64'], $pdfNome, $prefix);
            if ($savedName) {
                $sets[] = 'pdf_entrega_nome = ?';
                $params[] = $savedName;
                $sets[] = 'pdf_entrega_base64 = NULL';
            }
        } elseif (isset($extraData['pdf_entrega_nome'])) {
            $sets[] = 'pdf_entrega_nome = ?';
            $params[] = $extraData['pdf_entrega_nome'];
        }

        $params[] = (int)$id;
        $query = "UPDATE {$this->table} SET " . implode(', ', $sets) . " WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute($params);
    }

    public function deletarPdf($id) {
        // Buscar nome do arquivo atual para deletar do disco (pasta upload/)
        $stmt = $this->db->prepare("SELECT pdf_entrega_nome FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row && !empty($row['pdf_entrega_nome'])) {
            FileUpload::deleteDeliveryFile($row['pdf_entrega_nome']);
        }

        $now = date('Y-m-d H:i:s');
        $query = "UPDATE {$this->table}
                  SET status = 'em_confeccao', em_confeccao_at = ?, entregue_at = NULL,
                      pdf_entrega_base64 = NULL, pdf_entrega_nome = NULL, updated_at = ?
                  WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$now, $now, (int)$id]);
    }

    public function solicitarCorrecao($id, $textoCorrecao, $novaDescricao = '') {
        $now = date('Y-m-d H:i:s');

        // Se nova_descricao já veio montada do frontend, usar ela; senão concatenar
        if (!empty($novaDescricao)) {
            $descricaoFinal = $novaDescricao;
        } else {
            $stmt = $this->db->prepare("SELECT descricao_alteracoes FROM {$this->table} WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $original = $row['descricao_alteracoes'] ?? '';
            $descricaoFinal = $original . "\n\n--- SOLICITAÇÃO DE CORREÇÃO ---\n" . $textoCorrecao;
        }

        $query = "UPDATE {$this->table} SET status = 'pagamento_confirmado', descricao_alteracoes = ?,
                  pagamento_confirmado_at = ?, em_confeccao_at = NULL, entregue_at = NULL,
                  pdf_entrega_nome = NULL, pdf_entrega_base64 = NULL, updated_at = ?
                  WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$descricaoFinal, $now, $now, (int)$id]);
    }

    public function deletarPedido($id) {
        // Deletar arquivos do disco antes de remover o registro
        $stmt = $this->db->prepare("SELECT anexo1_nome, anexo2_nome, anexo3_nome, pdf_entrega_nome FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            foreach (['anexo1_nome', 'anexo2_nome', 'anexo3_nome', 'pdf_entrega_nome'] as $field) {
                if (!empty($row[$field])) {
                    if ($field === 'pdf_entrega_nome') {
                        FileUpload::deleteDeliveryFile($row[$field]);
                    } else {
                        FileUpload::deleteFile($row[$field]);
                    }
                }
            }
        }

        $query = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$id]);
    }

    public function getStats() {
        $query = "SELECT 
            SUM(CASE WHEN status = 'pagamento_confirmado' THEN 1 ELSE 0 END) as pendentes,
            SUM(CASE WHEN status = 'em_confeccao' THEN 1 ELSE 0 END) as aprovados,
            SUM(CASE WHEN status = 'entregue' THEN 1 ELSE 0 END) as finalizados,
            COUNT(*) as total,
            COALESCE(SUM(preco_pago), 0) as total_valor
            FROM {$this->table}";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
