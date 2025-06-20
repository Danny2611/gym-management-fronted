import { useEffect, useState } from "react";

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component này đảm bảo children chỉ được render trên client side
 * Giúp tránh hydration mismatch khi sử dụng localStorage
 */
const ClientOnly: React.FC<ClientOnlyProps> = ({
  children,
  fallback = <div>Loading...</div>,
}) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ClientOnly;
