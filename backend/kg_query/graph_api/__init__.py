"""Graph Visualization API — serves graph data for frontend G6 rendering.

Migrated from the legacy Flask standalone servers (connect_neo4j/).
All endpoints now use the unified Neo4jClient from core.database.
"""

from kg_query.graph_api.server_Arua import app as flask_app

__all__ = ["flask_app"]
