import { Navigate } from "react-router-dom";

/**
 * Alias historique — l'URL /demo/aomi-fragile redirige désormais vers le runner
 * générique de la bibliothèque de cas cliniques, qui sert le cas Mme R.
 */
export default function AomiFragileDemo() {
  return <Navigate to="/demo/clinical-cases/mme-r-aomi-fragile" replace />;
}
