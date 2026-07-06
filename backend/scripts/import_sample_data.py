"""Import sample Cypher data into Neo4j."""
import sys, os, re

from neo4j import GraphDatabase
from neo4j.exceptions import Neo4jError

URI = "bolt://localhost:7687"
USER = "neo4j"
PASSWORD = "221221221"
DATABASE = "neo4j"

cypher_path = os.path.join(os.path.dirname(__file__), "..", "config", "sample_data.cypher")

with open(cypher_path, "r", encoding="utf-8") as f:
    content = f.read()

# Split into statements: split on ; that ends a line (or is followed by newline)
# Remove comments and blank lines first
lines = content.split("\n")
statements = []
current = []
for line in lines:
    stripped = line.strip()
    if stripped.startswith("//") or stripped == "":
        continue
    current.append(line)
    if stripped.endswith(";"):
        statements.append("\n".join(current))
        current = []

if current:
    remaining = " ".join(current).strip()
    if remaining:
        statements.append(remaining)

print(f"Parsed {len(statements)} Cypher statements from {cypher_path}")

driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))

try:
    driver.verify_connectivity()
    print("Connected to Neo4j")
except Exception as e:
    print(f"Failed to connect to Neo4j: {e}")
    sys.exit(1)

with driver.session(database=DATABASE) as session:
    for i, stmt in enumerate(statements, 1):
        try:
            result = session.run(stmt)
            summary = result.consume()
            counters = summary.counters
            parts = []
            if counters.nodes_created: parts.append(f"{counters.nodes_created} nodes")
            if counters.relationships_created: parts.append(f"{counters.relationships_created} rels")
            if counters.nodes_deleted: parts.append(f"{counters.nodes_deleted} deleted")
            if counters.indexes_added: parts.append(f"idx:{counters.indexes_added}")
            if counters.constraints_added: parts.append(f"constraints:{counters.constraints_added}")
            detail = ", ".join(parts) if parts else "ok"
            preview = stmt.strip().split("\n")[0][:80]
            print(f"  [{i}/{len(statements)}] {detail} — {preview}")
        except Neo4jError as e:
            preview = stmt.strip().split("\n")[0][:80]
            print(f"  [{i}/{len(statements)}] ERROR: {e} — {preview}")

driver.close()
print("\nImport complete.")
