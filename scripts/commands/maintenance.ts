export async function enableMaintenance(message?: string) {
  console.log('Maintenance mode enabled', message ? `with message: ${message}` : '');
}

export async function disableMaintenance() {
  console.log('Maintenance mode disabled');
}


