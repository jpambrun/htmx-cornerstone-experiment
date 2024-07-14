

``` shell
# so we can bind 443
sudo setcap 'cap_net_bind_service=+ep' ~/bin/deno

# GO!
deno run --watch --allow-net --allow-read main.tsx
```