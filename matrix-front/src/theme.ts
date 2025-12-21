import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00ff41", // Неоново-зелёный как в Матрице
      light: "#66ff66",
      dark: "#00cc33"
    },
    secondary: {
      main: "#00e5ff", // Голубой акцент
      light: "#66ffff",
      dark: "#00b3cc"
    },
    background: {
      default: "#0a0a0a",
      paper: "#1a1a1a"
    },
    text: {
      primary: "#ffffff",
      secondary: "#b3b3b3"
    }
  },
  typography: {
    fontFamily: "'Courier New', monospace", // Моноширинный шрифт как в терминале
    h5: {
      fontWeight: 700,
      fontSize: "1.5rem",
      letterSpacing: "0.1em"
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.2rem",
      letterSpacing: "0.05em"
    },
    subtitle1: {
      fontFamily: "'Segoe UI', sans-serif", // Для читаемости
      fontWeight: 500
    },
    body2: {
      fontFamily: "'Segoe UI', sans-serif",
    }
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "linear-gradient(45deg, #0a0a0a 0%, #1a1a1a 100%)",
          minHeight: "100vh"
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(90deg, #001a00 0%, #003300 100%)",
          borderBottom: "1px solid #00ff41",
          boxShadow: "0 0 20px rgba(0, 255, 65, 0.3)"
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: "linear-gradient(180deg, #001a00 0%, #000d00 100%)",
          borderRight: "1px solid #00ff41",
          boxShadow: "0 0 15px rgba(0, 255, 65, 0.2)"
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "linear-gradient(145deg, #1a1a1a 0%, #2a2a2a 100%)",
          border: "1px solid #333",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(10px)",
          "&:hover": {
            borderColor: "#00ff41",
            boxShadow: "0 4px 25px rgba(0, 255, 65, 0.3)"
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          transition: "all 0.3s ease",
          color: "#00ff41",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 5px 15px rgba(0, 255, 65, 0.4)"
          },
          "&:disabled": {
            color: "#666666",
            backgroundColor: "rgba(0, 255, 65, 0.1)"
          }
        },
        contained: {
          background: "linear-gradient(45deg, #00ff41 0%, #00e5ff 100%)",
          color: "#000",
          fontWeight: 700,
          "&:disabled": {
            background: "linear-gradient(45deg, #666666 0%, #555555 100%)",
            color: "#999999"
          }
        },
        outlined: {
          borderColor: "#00ff41",
          color: "#00ff41",
          "&:hover": {
            borderColor: "#00e5ff",
            backgroundColor: "rgba(0, 229, 255, 0.1)"
          },
          "&:disabled": {
            borderColor: "#666666",
            color: "#666666"
          }
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            background: "linear-gradient(90deg, #00ff41 0%, rgba(0, 255, 65, 0.3) 100%)",
            color: "#000",
            fontWeight: 600
          },
          "&:hover": {
            background: "rgba(0, 255, 65, 0.1)",
            borderRight: "3px solid #00ff41"
          }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00ff41"
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00e5ff"
          }
        }
      }
    }
  }
});