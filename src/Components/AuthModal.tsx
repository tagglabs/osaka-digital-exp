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
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email);
    if (success) {
      onClose();
    } else {
      setError("Invalid administrator email");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Authentication Required">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Input
          type="email"
          label="ADMINISTRATOR EMAIL"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          required
        />
        <div className="flex justify-center">
          <Button
            type="submit"
            placeholder="Authenticate"
          />
        </div>
      </form>
    </Modal>
  );
};

export default AuthModal;