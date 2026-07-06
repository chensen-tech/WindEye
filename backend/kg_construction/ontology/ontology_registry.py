import os
import json
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class OntologyRegistry:
    _instance = None
    _config: Dict[str, Any] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(OntologyRegistry, cls).__new__(cls)
            cls._instance.load_config()
        return cls._instance

    def load_config(self, config_name: str = None):
        if config_name is None:
            dataset = os.getenv("KG_DATASET", "metaqa").lower()
            config_name = f"ontology_{dataset}.json"

        config_dir = os.path.dirname(os.path.abspath(__file__))
        config_path = os.path.join(config_dir, config_name)

        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                self._config = json.load(f)
            logger.info(f"[OntologyRegistry] Loaded ontology config from {config_path}")
        except Exception as e:
            logger.error(f"[OntologyRegistry] Failed to load config {config_path}: {e}")
            self._config = {}

    @classmethod
    def get_config(cls) -> Dict[str, Any]:
        return cls()._config

    @classmethod
    def get_node_label(cls) -> str:
        return cls()._config.get("global_node_label", "")

    @classmethod
    def get_valid_relations(cls) -> List[str]:
        return cls()._config.get("valid_relations", [])

    @classmethod
    def is_directed(cls) -> bool:
        return cls()._config.get("directed_query_mode", False)

    @classmethod
    def get_entity_matching_strategy(cls) -> Dict[str, str]:
        return cls()._config.get("entity_matching_strategy", {"mode": "exact_property", "property_key": "name"})

    @classmethod
    def get_return_target_types(cls) -> List[str]:
        return cls()._config.get("return_target_types", ["Node"])
