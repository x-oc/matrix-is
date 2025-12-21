import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: '#00ff41' }}>
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        Страница не найдена
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Запрошенная страница не существует или у вас нет к ней доступа.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Вернуться на главную
      </Button>
    </Box>
  );
}
