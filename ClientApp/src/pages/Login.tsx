import { AuthForm } from '../components/AuthForm';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/upload');
  };

  return <AuthForm type="login" onSuccess={handleSuccess} />;
}
