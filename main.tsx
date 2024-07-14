import { Hono,  } from "jsr:@hono/hono";
import { serveStatic } from 'jsr:@hono/hono/deno'


const downloadToBuffer = async (url: string) => {
  const res = await fetch(url);
  return await res.text();
};

const app = new Hono();
app.use('/static/*', serveStatic({root: './'}))

app.get("/", (c) => {
  const content = (
    <html>
      <head>
        <title>htmx+hono+webcomponent for the win</title>
        <script src="https://unpkg.com/htmx.org@2.0.1/dist/htmx.js"></script>
        <script type="module" src="./static/cornerstone-viewport.mjs"></script>
        <link rel="stylesheet" href="https://matcha.mizu.sh/matcha.css"></link>
      </head>
      <body>
        <section>
          <header>
              <h2>htmx+hono+webcomponent for the win</h2>
              <p>Simple example of using htmx. The button will get /mock and replace the text "here".</p>
          </header>
          <button
            class="btn"
            hx-get="/mock"
            hx-target="#user-details"
          >
            Let's Goooo!
          </button>
          <hr />
          <div class="flex no-overflow">
            <div id="user-details" class="flash grow m-1 bd-accent">
              here
            </div>
            <div id="user-details2" class="flash grow m-1 bd-active">
              <cornerstone-viewport imageIds="wadouri:./static/test.dcm"></cornerstone-viewport>
            </div>
          </div>
          <footer>
            <p>footer</p>
          </footer>
        </section>
      </body>
    </html>
  );
  return c.html(content);
});

app.get("/mock", (c) => {
  return c.html(
    <>
      name
      <p>some info</p>
    </>,
  );
});

Deno.serve({
  port: 443,
  onListen: () => {
    console.log("Listening on https://127-0-0-1.traefik.me/");
  },
  cert: await downloadToBuffer("https://traefik.me/cert.pem"),
  key: await downloadToBuffer("https://traefik.me/privkey.pem"),
}, app.fetch);
