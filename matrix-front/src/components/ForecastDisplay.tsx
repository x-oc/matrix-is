import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Forecast } from '../types/types';

interface ForecastDisplayProps {
  forecasts: Forecast[];
  unitId: number;
  unitName?: string;
  maxDisplay?: number;
}

export default function ForecastDisplay({ 
  forecasts, 
  unitId, 
  unitName,
  maxDisplay = 1 
}: ForecastDisplayProps) {
  const [open, setOpen] = useState(false);
  
  if (!forecasts || forecasts.length === 0) {
    return (
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Прогнозы отсутствуют
        </Typography>
      </Box>
    );
  }
  
  // Сортируем по дате (последние сначала)
  const sortedForecasts = [...forecasts].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const displayForecasts = maxDisplay ? sortedForecasts.slice(0, maxDisplay) : sortedForecasts;
  const hasMore = sortedForecasts.length > maxDisplay;
  
  const formatForecast = (forecast: string) => {
    // Простой парсинг для отображения структурированных прогнозов
    const lines = forecast.split('\n');
    return lines.map((line, index) => {
      if (line.includes('%')) {
        return (
          <Typography key={index} variant="body2" sx={{ color: '#00ff41' }}>
            {line}
          </Typography>
        );
      }
      if (line.toLowerCase().includes('рекомендация')) {
        return (
          <Typography key={index} variant="body2" fontWeight="bold" sx={{ color: '#ff6b6b' }}>
            {line}
          </Typography>
        );
      }
      return (
        <Typography key={index} variant="body2">
          {line}
        </Typography>
      );
    });
  };
  
  return (
    <>
      <Paper sx={{ p: 2, mt: 1, bgcolor: 'grey.900' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="subtitle2" color="primary">
            📊 Прогнозы Оракула
          </Typography>
          <Chip 
            label={`Прогнозы - ${forecasts.length}`} 
            size="small" 
            color="info"
          />
        </Stack>
        
        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
          {displayForecasts.map((forecast) => (
            <Box key={forecast.id}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {new Date(forecast.createdAt).toLocaleString()}
                </Typography>
              </Stack>
              <Box sx={{ mt: 0.5, p: 1, bgcolor: 'grey.800', borderRadius: 1 }}>
                {formatForecast(forecast.forecast)}
              </Box>
            </Box>
          ))}
        </Stack>
        
        {hasMore && (
          <Button 
            size="small" 
            variant="outlined" 
            onClick={() => setOpen(true)}
            sx={{ mt: 1.5 }}
          >
            Показать все прогнозы ({sortedForecasts.length})
          </Button>
        )}
      </Paper>
      
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Все прогнозы для {unitName ? unitName : `Юнита #${unitId}`}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {sortedForecasts.map((forecast) => (
              <Paper key={forecast.id} sx={{ p: 2, bgcolor: 'grey.900' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">
                    Прогноз от {new Date(forecast.createdAt).toLocaleString()}
                  </Typography>
                  <Chip 
                    label={forecast.id} 
                    size="small" 
                    variant="outlined"
                  />
                </Stack>
                <Box sx={{ p: 1.5, bgcolor: 'grey.800', borderRadius: 1 }}>
                  {formatForecast(forecast.forecast)}
                </Box>
              </Paper>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}