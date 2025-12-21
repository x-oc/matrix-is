import { useEffect, useRef } from "react";

interface Digit {
  x: number;
  y: number;
  speed: number;
  char: string;
  opacity: number;
}

export const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const digits = "0123456789";
    const characters: Digit[] = [];

    // Create initial characters
    const columnCount = Math.ceil(canvas.width / 20);
    for (let i = 0; i < columnCount; i++) {
      characters.push({
        x: i * 20,
        y: Math.random() * canvas.height,
        speed: Math.random() * 2 + 1,
        char: digits[Math.floor(Math.random() * digits.length)],
        opacity: Math.random() * 0.5 + 0.3
      });
    }

    let animationId: number;

    const animate = () => {
      // Clear canvas with semi-transparent black for trail effect
      ctx.fillStyle = "rgba(10, 10, 10, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update characters
      ctx.font = "20px 'Courier New', monospace";
      ctx.fillStyle = "#00ff41";

      characters.forEach((char, index) => {
        // Update position
        char.y += char.speed;

        // Reset to top if character goes off screen
        if (char.y > canvas.height) {
          char.y = -20;
          char.char = digits[Math.floor(Math.random() * digits.length)];
          char.speed = Math.random() * 2 + 1;
          char.opacity = Math.random() * 0.5 + 0.3;
        }

        // Draw character with gradient opacity
        const gradient = ctx.createLinearGradient(0, char.y - 50, 0, char.y + 50);
        gradient.addColorStop(0, "rgba(0, 255, 65, 0)");
        gradient.addColorStop(0.5, "rgba(0, 255, 65, " + (char.opacity + 0.3) + ")");
        gradient.addColorStop(1, "rgba(0, 255, 65, 0)");

        ctx.fillStyle = gradient;
        ctx.fillText(char.char, char.x, char.y);

        // Randomly change character
        if (Math.random() < 0.02) {
          char.char = digits[Math.floor(Math.random() * digits.length)];
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none"
      }}
    />
  );
};
