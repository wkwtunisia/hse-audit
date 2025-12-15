import { supabase } from "../supabaseClient";

export const getUserRole = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.app_metadata?.role || "user";
};

export const requireAdmin = async (navigate) => {
  const role = await getUserRole();
  if (role !== "admin") {
    alert("Access denied. Admins only.");
    navigate("/form"); // Redirect users to form instead
  }
};
