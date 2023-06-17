.PHONY: run compile install_local install_local_force

PERMISSION_FLAGS = --allow-net --allow-read --allow-env --allow-write
LOCAL_IMPORT_MAP = --import-map import_map.local.json
REMOTE_IMPORT_MAP = --import-map import_map.remote.json 
REMOTE_MAIN = https://raw.githubusercontent.com/Nasafato/pa/master/executables/helper/main.ts

run:
	deno run $(PERMISSION_FLAGS) main.ts

compile:
	deno compile $(PERMISSION_FLAGS) main.ts

install_local:
	deno install $(PERMISSION_FLAGS) $(LOCAL_IMPORT_MAP) main.ts
	deno install -n h $(PERMISSION_FLAGS) $(LOCAL_IMPORT_MAP) main.ts

install_local_force:
	deno install --force $(PERMISSION_FLAGS) $(LOCAL_IMPORT_MAP) main.ts

install_remote:
	deno install $(PERMISSION_FLAGS) $(REMOTE_IMPORT_MAP) -r -n rh $(REMOTE_MAIN)

run_remote:
	deno run $(PERMISSION_FLAGS) $(REMOTE_IMPORT_MAP) $(REMOTE_MAIN)

run_remote_debug:
	deno run --inspect-brk $(PERMISSION_FLAGS) $(REMOTE_IMPORT_MAP) $(REMOTE_MAIN)

run_remote_recompile:
	deno run $(PERMISSION_FLAGS) $(REMOTE_IMPORT_MAP) -r $(REMOTE_MAIN)