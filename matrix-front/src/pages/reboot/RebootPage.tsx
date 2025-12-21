import { useEffect, useState } from "react";
import { startAudit, completeAudit, listTheOneCandidates, chooseTheOne } from "@api/client";
import { Audit, TheOneCandidate } from "../../types";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Typography,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";

export default function RebootPage() {
  const [audit, setAudit] = useState<Audit | null>(null);
  const [pool, setPool] = useState<TheOneCandidate[]>([]);
  const [choice, setChoice] = useState<string>("neo");
  const [chosen, setChosen] = useState<TheOneCandidate | null>(null);
  const [notification, setNotification] = useState<{ title: string; message: string; severity: "success" | "error" } | null>(null);
  const selectionLocked = Boolean(chosen);
  const chosenColors = getChosenBadgeColors(chosen);
  const auditRunning = audit?.status === "RUNNING";
  const auditCompleted = audit?.status === "COMPLETED";
  const startDisabled = !selectionLocked || auditRunning || auditCompleted;
  const completeDisabled = !auditRunning || auditCompleted;

  useEffect(() => { listTheOneCandidates().then(setPool); }, []);

  const showSuccess = (title: string, message: string) => setNotification({ title, message, severity: "success" });
  const showError = (message: string) => setNotification({ title: "Ошибка", message, severity: "error" });
  const closeNotification = () => setNotification(null);

  const handleStartAudit = () => {
    if (!selectionLocked) {
      showError("Сначала необходимо выбрать Избранного.");
      return;
    }

    if (auditCompleted) {
      showError("Аудит уже завершён.");
      return;
    }

    if (auditRunning) {
      showError("Аудит уже запущен.");
      return;
    }

    startAudit()
      .then(result => {
        setAudit(result);
        showSuccess("Аудит запущен", "Архитектор инициировал тотальную ревизию Матрицы. Готовьтесь к проверке системных аномалий.");
      })
      .catch(() => showError("Не удалось запустить аудит. Попробуйте ещё раз позже."));
  };

  const handleCompleteAudit = () => {
    if (auditCompleted) {
      showError("Аудит уже завершён.");
      return;
    }

    if (!auditRunning) {
      showError("Нельзя завершить аудит до его запуска.");
      return;
    }

    completeAudit()
      .then(result => {
        setAudit(result);
        showSuccess("Аудит завершён", "Цикл проверки закрыт. Все протоколы переданы в архив Матрицы.");
      })
      .catch(() => showError("Не удалось завершить аудит. Проверьте соединение с Матрицей."));
  };

  const handleChooseTheOne = () => {
    const selectedCandidate = pool.find(candidate => candidate.id === choice);

    chooseTheOne(choice)
      .then(result => {
        setChosen(result);
        const name = result?.name ?? selectedCandidate?.name ?? "Избранный";
        showSuccess("Избранный подтверждён", `${name} готов к выходу за пределы Матрицы. Финальное интервью уже ждёт.`);
      })
      .catch(() => showError("Не удалось зафиксировать выбор. Повторите попытку."));
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12}><Typography variant="h5">Цикл перезагрузки (UC-301..304)</Typography></Grid>

      <Grid size={{ md: 6, xs: 12 }}>
        <Card>
          <CardContent>
            <Typography variant="h6">UC-301: Инициация аудита</Typography>
            <Typography variant="body2" color="text.secondary">Статус: {audit?.status ?? "IDLE"}</Typography>
            <Stack direction="row" spacing={1} mt={1}>
              <Button variant="contained" onClick={handleStartAudit} disabled={startDisabled}>Запустить аудит</Button>
              <Button onClick={handleCompleteAudit} disabled={completeDisabled}>Завершить аудит</Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ md: 6, xs: 12 }}>
        <Card
          sx={{
            opacity: selectionLocked ? 0.55 : 1,
            bgcolor: selectionLocked ? "grey.100" : "background.paper",
            transition: "opacity 0.2s ease",
          }}
        >
          <CardContent>
            <Typography variant="h6">UC-302: Выбор «Избранного»</Typography>
            <RadioGroup value={choice} onChange={e => setChoice(e.target.value)}>
              {pool.map(p => (
                <FormControlLabel
                  key={p.id}
                  value={p.id}
                  control={<Radio disabled={selectionLocked} />}
                  disabled={selectionLocked}
                  label={`${p.name} — шанс ${Math.round(p.probabilityOfSuccess * 100)}%`} />
              ))}
            </RadioGroup>
          </CardContent>
          <CardActions>
            <Button variant="contained" onClick={handleChooseTheOne} disabled={selectionLocked}>Выбрать</Button>
          </CardActions>
        </Card>
      </Grid>

      {/* <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6">UC-303: Подготовка ресурсов</Typography>
            <Typography variant="body2" color="text.secondary">
              Для демо считаем, что распоряжения Хранителю/Смотрителю/Сентинелям автоматически созданы после выбора.
            </Typography>
          </CardContent>
        </Card>
      </Grid> */}

      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="h6">UC-304: Финальное интервью</Typography>
            <Typography component="div" fontWeight={600} sx={{ color: "#00ff41" }}>Избранный:</Typography>
            <Typography
              component="div"
              sx={{
                display: "inline-block",
                bgcolor: chosenColors.bg,
                color: chosenColors.text,
                px: 2,
                py: 1,
                borderRadius: 2,
                fontWeight: 600,
                minWidth: 160,
                textAlign: "center",
                mt: 1,
              }}
            >
              {chosen?.name ?? "—"}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Dialog
        open={Boolean(notification)}
        maxWidth="sm"
        fullWidth
        onClose={closeNotification}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle>{notification?.title}</DialogTitle>
        <DialogContent>
          <Alert
            variant="filled"
            severity={notification?.severity ?? "success"}
            sx={{ fontSize: "1rem", alignItems: "center" }}
          >
            {notification?.message}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={closeNotification}>Продолжить</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

function getChosenBadgeColors(candidate: TheOneCandidate | null): { bg: string; text: string } {
  if (!candidate) {
    return { bg: "grey.900", text: "common.white" };
  }

  const probability = candidate.probabilityOfSuccess;

  if (probability >= 0.75) {
    return { bg: "success.main", text: "common.white" };
  }

  if (probability >= 0.45) {
    return { bg: "warning.main", text: "common.black" };
  }

  return { bg: "error.main", text: "common.white" };
}
