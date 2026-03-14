<?php
// src/services/MercadoPagoService.php

class MercadoPagoService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Salvar pagamento PIX no banco de dados
     */
    public function savePixPayment($userId, $paymentData) {
        try {
            // ✅ GARANTIR que payment_id seja STRING
            $paymentId = (string)($paymentData['id'] ?? '');
            
            error_log("💾 [MP-SERVICE] savePixPayment chamado");
            error_log("💾 [MP-SERVICE] User ID: $userId");
            error_log("💾 [MP-SERVICE] Payment ID (raw): " . ($paymentData['id'] ?? 'NULL'));
            error_log("💾 [MP-SERVICE] Payment ID (string): $paymentId");
            error_log("💾 [MP-SERVICE] Payment ID (type): " . gettype($paymentId));
            error_log("💾 [MP-SERVICE] Payment ID (strlen): " . strlen($paymentId));
            
            if (empty($paymentId)) {
                error_log("💾 [MP-SERVICE] ❌ Payment ID está vazio!");
                return [
                    'success' => false,
                    'error' => 'Payment ID is required'
                ];
            }
            
            $query = "INSERT INTO basepg_pix (
                user_id, payment_id, amount, description, external_reference,
                qr_code, qr_code_base64, transaction_id,
                status, status_detail, payer_email, payer_name,
                gateway_response, expires_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $this->db->prepare($query);
            
            $expiresAt = isset($paymentData['date_of_expiration']) 
                ? date('Y-m-d H:i:s', strtotime($paymentData['date_of_expiration']))
                : date('Y-m-d H:i:s', strtotime('+30 minutes'));
            
            $payerEmail = $paymentData['payer']['email'] ?? null;
            $payerName = $paymentData['payer']['name'] ?? null;
            $mappedStatus = $this->mapStatus($paymentData['status']);
            
            error_log("💾 [MP-SERVICE] Dados para inserir:");
            error_log("💾 [MP-SERVICE] - Payment ID: " . $paymentData['id']);
            error_log("💾 [MP-SERVICE] - Amount: " . $paymentData['transaction_amount']);
            error_log("💾 [MP-SERVICE] - Status original: " . $paymentData['status']);
            error_log("💾 [MP-SERVICE] - Status mapeado: " . $mappedStatus);
            error_log("💾 [MP-SERVICE] - Payer email: " . ($payerEmail ?? 'NULL'));
            
            // ✅ Usar a variável $paymentId que já é STRING
            $stmt->execute([
                $userId,
                $paymentId,  // ✅ Já convertido para STRING acima
                $paymentData['transaction_amount'],
                'RECARGA PIX',  // Descrição padrão
                $paymentData['external_reference'] ?? null,
                $paymentData['point_of_interaction']['transaction_data']['qr_code'] ?? null,
                $paymentData['point_of_interaction']['transaction_data']['qr_code_base64'] ?? null,
                $paymentData['point_of_interaction']['transaction_data']['transaction_id'] ?? null,
                $mappedStatus,
                $paymentData['status_detail'] ?? null,
                $payerEmail,
                $payerName,
                json_encode($paymentData),
                $expiresAt
            ]);
            
            $internalId = $this->db->lastInsertId();
            
            error_log("💾 [MP-SERVICE] ✅ Pagamento salvo com sucesso!");
            error_log("💾 [MP-SERVICE] Internal ID: $internalId");
            
            return [
                'success' => true,
                'payment_id' => $paymentId,  // ✅ Retornar a versão STRING
                'internal_id' => $internalId
            ];
            
        } catch (Exception $e) {
            error_log("💾 [MP-SERVICE] ❌ Erro ao salvar pagamento PIX: " . $e->getMessage());
            error_log("💾 [MP-SERVICE] Stack trace: " . $e->getTraceAsString());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Atualizar status de pagamento PIX via webhook
     */
    public function updatePixPaymentStatus($paymentId, $webhookData) {
        try {
            // ✅ GARANTIR que payment_id seja STRING
            $paymentId = (string)$paymentId;
            
            error_log("🔍 [MP-SERVICE] updatePixPaymentStatus chamado");
            error_log("🔍 [MP-SERVICE] Payment ID (string): $paymentId");
            error_log("🔍 [MP-SERVICE] Payment ID (type): " . gettype($paymentId));
            error_log("🔍 [MP-SERVICE] Payment ID (strlen): " . strlen($paymentId));
            
            // Buscar pagamento existente
            $query = "SELECT * FROM basepg_pix WHERE payment_id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$paymentId]);
            $payment = $stmt->fetch(PDO::FETCH_ASSOC);
            
            error_log("🔍 [MP-SERVICE] Pagamento encontrado: " . ($payment ? 'SIM (ID interno: ' . $payment['id'] . ')' : 'NÃO'));
            
            if (!$payment) {
                error_log("🔍 [MP-SERVICE] ❌ Pagamento NÃO encontrado para payment_id: $paymentId");
                return [
                    'success' => false,
                    'error' => 'Pagamento não encontrado'
                ];
            }
            
            error_log("🔍 [MP-SERVICE] ✅ Pagamento encontrado! Prosseguindo com atualização...");
            
            // Atualizar histórico de notificações
            $notifications = json_decode($payment['webhook_notifications'] ?? '[]', true);
            $notifications[] = [
                'received_at' => date('Y-m-d H:i:s'),
                'data' => $webhookData
            ];
            
            // Atualizar status
            $updateQuery = "UPDATE basepg_pix SET 
                status = ?,
                status_detail = ?,
                webhook_notifications = ?,
                last_webhook_at = NOW(),
                approved_at = CASE WHEN ? = 'approved' THEN NOW() ELSE approved_at END,
                updated_at = NOW()
                WHERE payment_id = ?";
            
            $stmt = $this->db->prepare($updateQuery);
            $newStatus = $this->mapStatus($webhookData['status'] ?? $webhookData['action']);
            
            $stmt->execute([
                $newStatus,
                $webhookData['status_detail'] ?? null,
                json_encode($notifications),
                $newStatus,
                $paymentId
            ]);
            
            // Se aprovado, creditar saldo do usuário
            if ($newStatus === 'approved') {
                $this->creditUserBalance($payment['user_id'], $payment['amount'], $paymentId);
            }
            
            return [
                'success' => true,
                'status' => $newStatus,
                'credited' => $newStatus === 'approved'
            ];
            
        } catch (Exception $e) {
            error_log("Erro ao atualizar status PIX: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Creditar saldo do usuário após aprovação do pagamento
     */
    private function creditUserBalance($userId, $amount, $paymentId) {
        try {
            // VERIFICAR SE JÁ FOI CREDITADO (evitar duplicação)
            $checkStmt = $this->db->prepare("SELECT COUNT(*) FROM wallet_transactions WHERE description LIKE ? AND user_id = ? AND type = 'recarga'");
            $checkStmt->execute(["%PIX%payment_id:$paymentId%", $userId]);
            
            if ($checkStmt->fetchColumn() > 0) {
                error_log("⚠️ [MP-SERVICE] Pagamento $paymentId já foi creditado para usuário $userId - IGNORANDO duplicação");
                return true; // Já foi processado
            }
            
            $this->db->beginTransaction();

            // Saldo atual do usuário
            $stmt = $this->db->prepare("SELECT saldo FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $currentSaldo = (float)($stmt->fetchColumn() ?? 0);

            $amount = (float)$amount;
            $newSaldo = $currentSaldo + $amount;

            // Atualizar tabela users (carteira principal)
            $stmt = $this->db->prepare("UPDATE users SET saldo = ?, saldo_atualizado = 1, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$newSaldo, $userId]);

            // Upsert na carteira principal (user_wallets)
            $walletStmt = $this->db->prepare("INSERT INTO user_wallets (user_id, wallet_type, current_balance, available_balance, total_deposited, last_transaction_at)
                                             VALUES (?, 'main', ?, ?, ?, NOW())
                                             ON DUPLICATE KEY UPDATE
                                               current_balance = VALUES(current_balance),
                                               available_balance = VALUES(available_balance),
                                               total_deposited = total_deposited + VALUES(total_deposited),
                                               last_transaction_at = NOW(),
                                               updated_at = NOW()");
            $walletStmt->execute([$userId, $newSaldo, $newSaldo, $amount]);

            // Registrar transação de recarga
            $description = "RECARGA PIX - payment_id:$paymentId";
            $txStmt = $this->db->prepare("INSERT INTO wallet_transactions
                                         (user_id, wallet_type, type, amount, balance_before, balance_after, description, payment_method, status)
                                         VALUES (?, 'main', 'recarga', ?, ?, ?, ?, 'pix', 'completed')");
            $txStmt->execute([$userId, $amount, $currentSaldo, $newSaldo, $description]);
            $transactionId = $this->db->lastInsertId();

            // ✅ REGISTRAR NA CENTRAL_CASH (OBRIGATÓRIO)
            // Buscar saldo atual do caixa central
            $centralBalanceQuery = "SELECT COALESCE(SUM(
                CASE 
                    WHEN transaction_type IN ('entrada', 'recarga', 'comissao', 'plano') THEN amount
                    WHEN transaction_type IN ('saida', 'consulta', 'saque', 'estorno') THEN -amount
                    ELSE 0
                END
            ), 0.00) as balance FROM central_cash";
            
            $centralBalanceStmt = $this->db->prepare($centralBalanceQuery);
            $centralBalanceStmt->execute();
            $centralCurrentBalance = (float)$centralBalanceStmt->fetchColumn();
            $centralNewBalance = $centralCurrentBalance + $amount;
            
            // Registrar entrada no caixa central
            $centralCashQuery = "INSERT INTO central_cash 
                               (transaction_type, amount, balance_before, balance_after, description, user_id, payment_method, reference_table, reference_id, external_id) 
                               VALUES ('recarga', ?, ?, ?, ?, ?, 'pix', 'wallet_transactions', ?, ?)";
            $centralStmt = $this->db->prepare($centralCashQuery);
            $centralStmt->execute([
                $amount, 
                $centralCurrentBalance, 
                $centralNewBalance, 
                $description, 
                $userId, 
                $transactionId,
                $paymentId
            ]);
            
            error_log("✅ [MP-SERVICE] Recarga PIX creditada com sucesso:");
            error_log("✅ [MP-SERVICE] - User ID: $userId");
            error_log("✅ [MP-SERVICE] - Valor: R$ $amount");
            error_log("✅ [MP-SERVICE] - Saldo anterior: R$ $currentSaldo");
            error_log("✅ [MP-SERVICE] - Novo saldo: R$ $newSaldo");
            error_log("✅ [MP-SERVICE] - Central Cash: R$ $centralCurrentBalance → R$ $centralNewBalance");
            error_log("✅ [MP-SERVICE] - Payment ID: $paymentId");

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log('❌ [MP-SERVICE] Erro ao creditar saldo: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Mapear status do Mercado Pago para nosso sistema
     */
    private function mapStatus($mpStatus) {
        $statusMap = [
            'pending' => 'pending',
            'approved' => 'approved',
            'authorized' => 'approved',
            'in_process' => 'pending',
            'in_mediation' => 'pending',
            'rejected' => 'rejected',
            'cancelled' => 'cancelled',
            'refunded' => 'cancelled',
            'charged_back' => 'cancelled'
        ];
        
        return $statusMap[$mpStatus] ?? 'pending';
    }
    
    /**
     * Buscar pagamento PIX por ID
     */
    public function getPixPayment($paymentId) {
        try {
            $query = "SELECT * FROM basepg_pix WHERE payment_id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$paymentId]);
            $payment = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return [
                'success' => true,
                'data' => $payment
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Listar pagamentos PIX do usuário
     */
    public function listUserPixPayments($userId, $limit = 50) {
        try {
            $query = "SELECT * FROM basepg_pix 
                     WHERE user_id = ? 
                     ORDER BY created_at DESC 
                     LIMIT ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId, $limit]);
            $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return [
                'success' => true,
                'data' => $payments
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
