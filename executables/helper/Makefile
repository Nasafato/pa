.PHONY: run compile install_local install_local_force

PERMISSION_FLAGS = --allow-net --allow-read --allow-env --allow-write
LOCAL_IMPORT_MAP = --import-map import_map.local.json

run:
	deno run $(PERMISSION_FLAGS) main.ts

compile:
	deno compile $(PERMISSION_FLAGS) main.ts

install_local:
	deno install $(PERMISSION_FLAGS) $(LOCAL_IMPORT_MAP) main.ts
	deno install -n h $(PERMISSION_FLAGS) $(LOCAL_IMPORT_MAP) main.ts

install_local_force:
	deno install --force $(PERMISSION_FLAGS) $(LOCAL_IMPORT_MAP) main.ts
