// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Spinner, Row, Col } from 'react-bootstrap';
import authService from '../services/authService'; // Pastikan path ini benar
import { useAuth } from '../contexts/AuthContext';   // Pastikan path ini benar

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login: contextLogin } = useAuth(); // Dapatkan fungsi login dari AuthContext

  // Cek apakah ada pesan dari redirect (misalnya, setelah logout atau sesi expired)
  const locationState = location.state;
  const redirectMessage = locationState?.message;


  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Panggil fungsi login dari authService
      const data = await authService.login(username, password); 
      
      // Jika login berhasil di backend, data akan berisi user dan token
      // authService sudah menyimpan token dan user ke localStorage
      // Sekarang update state global melalui contextLogin
      contextLogin(data.user, data.token);
      
      // Arahkan ke dashboard atau halaman asal sebelum redirect (jika ada)
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });

    } catch (err) {
      // authService.login akan melempar error dengan properti 'message'
      const errorMessage = err.message || 'Login gagal. Silakan periksa kembali username dan password Anda.';
      console.error('Login error di LoginPage:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container 
      fluid 
      className="d-flex flex-column align-items-center justify-content-center" 
      style={{ 
        minHeight: '100vh', 
        backgroundColor: '#eef2f6',
        padding: '1rem' 
      }}
    >
      <Row className="justify-content-center w-100 my-auto"> 
        <Col xs={12} sm={10} md={8} lg={6} xl={5} xxl={4}>
          <Card className="shadow-lg border-0 rounded-3">
            <Card.Body className="p-4 p-sm-5">
              <h2 className="text-center mb-4 fw-bolder text-dark">Login Admin SPK</h2> {/* Judul disesuaikan */}
              
              {redirectMessage && <Alert variant="info" className="mb-3 small">{redirectMessage}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formUsername">
                  <Form.Label className="fw-medium">Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    required
                    size="lg"
                    autoFocus // Fokus ke input username saat halaman dimuat
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPassword">
                  <Form.Label className="fw-medium">Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    size="lg"
                  />
                </Form.Group>

                {error && <Alert variant="danger" className="mt-3 py-2 small">{error}</Alert>}

                <Button variant="primary" type="submit" className="w-100 mt-3 py-2" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Memproses...
                    </>
                  ) : ( 'Login' )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;