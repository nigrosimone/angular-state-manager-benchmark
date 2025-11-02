# AngularBenchmark

Small monorepo with two example of "Angular Counter App" demonstrating different state performance:

- `projects\ngrx` — Angular Counter App with NgRx state manager
- `projects\ngss` — Angular Counter App with NgSimpleState state manager

## Quick start

1 Install dependencies

```shell
npm install
```

2 Run benchmark:

```shell
npm run benchmark:prod
```

3 Result in `cypress\results.json`

```json
{
  "NgRx": "2189.30",
  "NgSimpleState": "1769.10",
  "faster": "NgSimpleState",
  "difference": "420.20",
  "percent": "19.2"
}
```
