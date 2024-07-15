import { Hono } from "jsr:@hono/hono";
import { serveStatic } from "jsr:@hono/hono/deno";

const downloadToBuffer = async (url: string) => {
  const res = await fetch(url);
  return await res.text();
};

const app = new Hono();
app.use("/static/*", serveStatic({ root: "./" }));

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
            <p>
              Simple example of using htmx. The button will GET /mock and
              return:
              <pre><code>&lt;cornerstone-viewport <span class="hljs-attribute">imageIds</span>=<span class="hljs-string">"wadouri:./static/test.dcm"</span>/&gt;</code></pre>.
            </p>
          </header>
          <hr />
          <div class="flex no-overflow">
            <div id="series" class="flash m-.25 bd-accent">
              some series here
              <br />
              <button
                class="btn"
                hx-get="/mock"
                hx-target="#viewport1"
              >
                Let's Goooo!
              </button>
            </div>
            <div id="viewport1" class="flash grow m-.25 bd-active">
              GO?
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

let mockCount = 0;
app.get("/mock", (c) => {
  mockCount++;
  return c.html(
    <cornerstone-viewport
      count={mockCount}
      imageIds={`wadouri:./static/test${mockCount % 2}.dcm`}
    />,
  );
});

Deno.serve({
  port: 443,
  onListen: () => console.log("Listening on https://127-0-0-1.traefik.me/"),
  cert: await downloadToBuffer("https://traefik.me/cert.pem"),
  key: await downloadToBuffer("https://traefik.me/privkey.pem"),
}, app.fetch);
