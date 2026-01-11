<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLogger
{
    /**
     * Log an action.
     *
     * @param string $action The action description (e.g., "User logged in")
     * @param mixed $entity The model instance being acted upon (optional)
     * @param array $metadata Additional context data (optional)
     * @return AuditLog|null
     */
    public static function log(string $action, $entity = null, array $metadata = [])
    {
        try {
            $user = Auth::user();

            $logData = [
                'action' => $action,
                'performed_by' => $user ? $user->id : null,
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
                'metadata' => $metadata,
                'created_at' => now(),
            ];

            if ($entity) {
                $logData['entity_type'] = get_class($entity);
                $logData['entity_id'] = $entity->id;
            } else {
                // Fallback for actions without a specific entity (e.g., login)
                // We can use the user as the entity if appropriate, or leave it generic
                $logData['entity_type'] = 'system';
                $logData['entity_id'] = 0;

                if ($action === 'User logged in' && $user) {
                    $logData['entity_type'] = get_class($user);
                    $logData['entity_id'] = $user->id;
                }
            }

            return AuditLog::create($logData);
        } catch (\Exception $e) {
            // Fail silently to avoid breaking the main application flow
            // In a production env, you might want to log this error to a file
            \Log::error('Audit Log Error: ' . $e->getMessage());
            return null;
        }
    }
}
