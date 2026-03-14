<?php
require_once __DIR__ . '/BaseModel.php';
require_once __DIR__ . '/../utils/FileUpload.php';

class PdfRg extends BaseModel {
    protected $table = 'pdf_rg_pedidos';

    private $validStatuses = ['realizado', 'pagamento_confirmado', 'em_confeccao', 'entregue'];

    public function __construct($db) {
        parent::__construct($db);
    }

    public function criarPedido($data) {
        $cpf = preg_replace('/\D/', '', (string)($data['cpf'] ?? ''));
        if ($cpf === '') {
            throw new Exception('CPF é obrigatório');
        }

        $now = date('Y-m-d H:i:s');

        $payload = [
            'module_id'          => (int)($data['module_id'] ?? 0),
            'user_id'            => isset($data['user_id']) ? (int)$data['user_id'] : null,
            'cpf'                => $cpf,
            'nome'               => trim($data['nome'] ?? '') ?: null,
            'dt_nascimento'      => $data['dt_nascimento'] ?? null,
            'naturalidade'       => trim($data['naturalidade'] ?? '') ?: null,
            'filiacao_mae'       => trim($data['filiacao_mae'] ?? '') ?: null,
            'filiacao_pai'       => trim($data['filiacao_pai'] ?? '') ?: null,
            'diretor'            => $data['diretor'] ?? null,
            'assinatura_base64'  => $data['assinatura_base64'] ?? null,
            'foto_base64'        => $data['foto_base64'] ?? null,
            'anexo1_base64'      => null,
            'anexo1_nome'        => null,
            'anexo2_base64'      => null,
            'anexo2_nome'        => null,
            'anexo3_base64'      => null,
            'anexo3_nome'        => null,
            'qr_plan'            => $data['qr_plan'] ?? '1m',
            'status'             => 'realizado',
            'preco_pago'         => (float)($data['preco_pago'] ?? 0),
            'desconto_aplicado'  => (float)($data['desconto_aplicado'] ?? 0),
            'realizado_at'       => $now,
            'pagamento_confirmado_at' => $now,
            'em_confeccao_at'    => null,
            'entregue_at'        => null,
            'created_at'         => $now,
            'updated_at'         => $now,
        ];

        foreach ($payload as $k => $v) {
            if ($v === '') $payload[$k] = null;
        }

        // Auto-advance to pagamento_confirmado since payment is always done at creation
        $payload['status'] = 'pagamento_confirmado';

        $id = parent::create($payload);

        // Salvar anexos em disco com nome padronizado por CPF (CPF_base1/2/3.ext)
        for ($i = 1; $i <= 3; $i++) {
            $base64Key = "anexo{$i}_base64";
            $nomeKey = "anexo{$i}_nome";

            if (!empty($data[$base64Key])) {
                $originalName = $data[$nomeKey] ?? "anexo{$i}.pdf";
                $fixedBaseName = "{$cpf}_base{$i}";
                $savedName = FileUpload::saveBase64FileAs($data[$base64Key], $originalName, $fixedBaseName);

                if (!$savedName) {
                    throw new Exception("Falha ao salvar o anexo {$i}. Verifique formato e tamanho do arquivo.");
                }

                $stmt = $this->db->prepare("UPDATE {$this->table} SET {$nomeKey} = ? WHERE id = ?");
                $stmt->execute([$savedName, $id]);
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
            $where[] = '(nome LIKE ? OR cpf LIKE ?)';
            $params[] = '%' . $search . '%';
            $params[] = '%' . preg_replace('/\D/', '', $search) . '%';
        }

        $whereSql = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $query = "SELECT id, module_id, user_id, cpf, nome, dt_nascimento, naturalidade,
                         filiacao_mae, filiacao_pai, diretor, qr_plan, status,
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
            $where[] = '(nome LIKE ? OR cpf LIKE ?)';
            $params[] = '%' . $search . '%';
            $params[] = '%' . preg_replace('/\D/', '', $search) . '%';
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
            $prefix = "pdfrg_{$id}_entrega";
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
        // Buscar nome do arquivo para deletar do disco
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

    public function deletarPedido($id) {
        // Deletar arquivos do disco
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
}
