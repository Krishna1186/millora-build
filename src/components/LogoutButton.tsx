
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

const LogoutButton = () => {
  const { signOut } = useAuth();

  return (
    <Button 
      onClick={signOut}
      variant="ghost" 
      className="flex items-center gap-2 text-gray-600 hover:text-red-600 font-light"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </Button>
  );
};

export default LogoutButton;
