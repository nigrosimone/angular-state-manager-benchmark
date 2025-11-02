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

3 Output

```shell
NgRx: 2029.60 ms
NgSimpleState: 1795.40 ms
NgSimpleState faster than 234.20 ms (11.5%)
```
