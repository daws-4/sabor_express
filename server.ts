import express, { Request, Response } from "express";
import next from "next";
import { parse } from "url";
import { iniciarTareasProgramadas } from "./lib/cron-jobs"; 

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Iniciar las tareas programadas
  iniciarTareasProgramadas(); 

  // Para todas las solicitudes, deja que Next.js las maneje
  server.all("*", (req: Request, res: Response) => {
    const parsedUrl = parse(req.url, true);
    return handle(req, res, parsedUrl);
  });

  server.listen(port, (err?: any) => {
    if (err) throw err;
    console.log(`> Servidor personalizado listo en http://localhost:${port}`);
  });
});
