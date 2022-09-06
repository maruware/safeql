export function getLeftJoinTablesFromParsed($parsed: unknown): string[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed = $parsed as any;
  const tables = [];

  if (parsed.stmts === undefined) {
    return [];
  }

  for (const stmt of parsed.stmts) {
    if (!("SelectStmt" in stmt.stmt) || !("fromClause" in stmt.stmt.SelectStmt)) {
      return [];
    }

    for (const fromClause of stmt.stmt.SelectStmt.fromClause) {
      if (fromClause.JoinExpr) {
        tables.push(...recursiveGetJoinExpr(fromClause.JoinExpr, []));
      }
    }
  }

  return tables;
}

type JoinExpression = {
  jointype: string;
  larg:
    | {
        RangeVar: {
          relname: string;
        };
      }
    | {
        JoinExpr: JoinExpression;
      };
  rarg: {
    RangeVar: {
      relname: string;
    };
  };
};

function recursiveGetJoinExpr(joinExpr: JoinExpression, tables: string[]): string[] {
  const newTables =
    joinExpr.jointype === "JOIN_LEFT" ? [...tables, joinExpr.rarg.RangeVar.relname] : tables;

  if ("JoinExpr" in joinExpr.larg) {
    return recursiveGetJoinExpr(joinExpr.larg.JoinExpr, newTables);
  }

  return newTables;
}
