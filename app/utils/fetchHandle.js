const baseUrl = import.meta.env.VITE_HYDROGEN_BASE_URL;

export const getHandleById = async (id, type) => {
  try {
    const response = await fetch(
      `${baseUrl?.replace(/\/+$/, '')}/getHandleById?id=${id}&type=${type}`,
    );
    const data = await response.json();

    if (!response.ok) {
      console.error('Error fetching handle:', data.error);
      return null;
    }

    return data.handle;
  } catch (error) {
    console.error('Failed to fetch handle:', error);
    return null;
  }
};
