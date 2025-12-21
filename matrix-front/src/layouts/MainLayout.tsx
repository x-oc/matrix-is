import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    IconButton,
    Stack
} from "@mui/material";
import { ExitToApp as LogoutIcon } from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import RoleBadge from "@components/RoleBadge";
import { useAuth } from "@auth/useAuth";
import { appRoutes } from "../routes";
import { useEffect } from "react";
import { MatrixBackground } from "@components/MatrixBackground";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        if (!user) return;

        const availableRoutes = appRoutes.filter(r => r.roles.includes(user.role));
        const isCurrentPathAvailable = availableRoutes.some(route =>
            location.pathname === route.path || location.pathname === '/'
        );

        if (!isCurrentPathAvailable && availableRoutes.length > 0) {
            navigate(availableRoutes[0].path, { replace: true });
        }
    }, [user, location.pathname, navigate]);

    if (!user) {
        return null;
    }

    const visibleMenu = appRoutes.filter(r => r.roles.includes(user.role));

    return (
        <Box sx={{ display: "flex", minHeight: '100vh', flexDirection: 'column' }}>
            <MatrixBackground />

            <AppBar
                position="fixed"
                sx={{
                    background: "linear-gradient(90deg, #001a00 0%, #003300 100%)",
                    borderBottom: "2px solid #00ff41",
                    boxShadow: "0 0 30px rgba(0, 255, 65, 0.5)",
                    backdropFilter: "blur(10px)",
                    zIndex: 1200
                }}
            >
                <Toolbar sx={{ gap: 2, minHeight: 64, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', pt: 1, pb: 0 }}>
                    <Stack direction="row" sx={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: "'Orbitron', sans-serif",
                                fontWeight: 700,
                                letterSpacing: '0.1em'
                            }}
                        >
                            MATRIX CONTROL
                        </Typography>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "inherit",
                                    fontFamily: "'Share Tech Mono', monospace"
                                }}
                            >
                                {user.username}
                            </Typography>
                            <RoleBadge role={user.role} />
                            <IconButton
                                color="inherit"
                                onClick={logout}
                                title="Выйти из системы"
                                size="medium"
                                sx={{
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 255, 65, 0.1)'
                                    }
                                }}
                            >
                                <LogoutIcon />
                            </IconButton>
                        </Stack>
                    </Stack>

                    <Stack direction="row" sx={{ width: '100%', gap: 0.5, alignItems: 'center', pb: 1, overflowX: 'auto' }}>
                        {visibleMenu.map(m => (
                            <Button
                                key={m.path}
                                component={Link}
                                to={m.path}
                                sx={{
                                    color: location.pathname === m.path ? "#00ff41" : "inherit",
                                    fontFamily: "'Rajdhani', sans-serif",
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    textTransform: 'uppercase',
                                    background: location.pathname === m.path ? "rgba(0, 255, 65, 0.15)" : "transparent",
                                    border: location.pathname === m.path ? "1px solid #00ff41" : "1px solid transparent",
                                    borderRadius: "6px",
                                    px: 2,
                                    py: 0.75,
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        color: "#00ff41",
                                        background: "rgba(0, 255, 65, 0.15)",
                                        border: '1px solid #00ff41',
                                        borderRadius: "2px"
                                    }
                                }}
                            >
                                {m.label}
                            </Button>
                        ))}
                    </Stack>
                </Toolbar>
            </AppBar>

            <Box
                component="main"
                sx={{
                    flex: 1,
                    p: 3,
                    mt: 16,
                    minHeight: 'calc(100vh - 128px)',
                    position: 'relative'
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
