export async function getAdminAccessKey(docSnap) {
  if (!docSnap) {
    return null;
  }

  if (docSnap.exists()) {
    const configuredKey = docSnap.data()?.accessKey;
    return typeof configuredKey === "string" && configuredKey.trim().length > 0
      ? configuredKey.trim()
      : null;
  }

  return null;
}

export async function resolveAdminAccessKey(getDocResult) {
  try {
    const docSnap = await getDocResult();
    return getAdminAccessKey(docSnap);
  } catch {
    return null;
  }
}

export function isValidAdminAccessKey(inputKey, correctKey) {
  return typeof inputKey === "string" && typeof correctKey === "string" && correctKey.trim().length > 0
    ? inputKey.trim() === correctKey.trim()
    : false;
}
