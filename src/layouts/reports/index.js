
import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import CreateDocument from "./components/create.js"

function Report() {
  return (
    <DashboardLayout>
      <DashboardNavbar isMini />
      <CreateDocument/>
      <Footer />
    </DashboardLayout>
  );
}

export default Report;
