import { TextField, TextFieldProps, Box, Typography } from "@mui/material";

interface FieldProps extends Omit<TextFieldProps, 'onClick'> {
  onClick?: () => void;
}

export default function Field({ onClick, ...props }: FieldProps) {
  if (onClick) {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {props.label}
        </Typography>
        <Box
          onClick={onClick}
          sx={{
            p: 1,
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 1,
            cursor: 'pointer',
            backgroundColor: 'grey.50',
            '&:hover': {
              backgroundColor: 'grey.100',
            }
          }}
        >
          <Typography variant="body2">
            {props.value}
          </Typography>
        </Box>
      </Box>
    );
  }

  return <TextField fullWidth size="small" margin="dense" {...props} />;
}
