import subprocess

# List of applications and their respective ports
apps = [
    {"file": "datedem.py", "port": 5001},
    {"file": "demanda.py", "port": 5002},
    {"file": "senti.py", "port": 5003},
    {"file": "score.py", "port": 5004},
]

# Start each app in a separate subprocess
processes = []
for app in apps:
    command = ["python", app["file"]]
    processes.append(subprocess.Popen(command))

# Wait for the processes to complete
for process in processes:
    process.wait()
