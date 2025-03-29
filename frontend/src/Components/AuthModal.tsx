import { useState } from "react";
import Modal from "./Modal";
import { useAuth } from "../contexts/AuthContext";
import { Input } from "./Input";
import { Button } from "./Button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [email, setEmail] = useState("");
  const { login, isLoading, error: authError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enter your email address">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Input
          type="email"
          label="ADMINISTRATOR EMAIL"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={authError || undefined}
          required
        />
        <div className="flex justify-center">
          <Button
            type="submit"
            placeholder={isLoading ? "Loading..." : "Login"}
            disabled={isLoading}
          />
        </div>
      </form>
    </Modal>
  );
};

export default AuthModal;