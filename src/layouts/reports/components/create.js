import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db, addData } from "../../authentication/components/firebase.js";
import DataTable from "examples/Tables/DataTable";
import UploadFileDialog from "components/Dialog/UploadFileDialog.js";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import { COLUMNS } from "./columns.js";
import {
  getCurrentDate,
  convertDateTimeStringToVnTime,
} from "../../../components/utils.js";
import { useAuthUser, useSignIn } from "react-auth-kit";
import { rolePermissionRule } from "../../authentication/sign-in/rolePermissionRule.js";
import { read, utils, writeFile } from 'xlsx';

async function getDocuments() {
  const q = query(collection(db, "Documents"));
  const querySnapshot = await getDocs(q);
  const docData = [];
  querySnapshot.forEach((doc) => {
    docData.push(doc.data());
  });
  return docData;
}

function CreateDocument() {
  const [data, setData] = useState([]);
  const user = useAuthUser()();

  async function fetchData() {
    const docData = await getDocuments();
    await setData(
      docData.map((current) => {
        return {
          ...current,

          TepDinhKem: current.TepDinhKem ? (
            <div>
              <a href={current.TepDinhKem} target="_blank">
                Xem tệp
              </a>
            </div>
          ) : (
            ""
          ),
          HanhDong: (
            <MDBox>
              {rolePermissionRule(user.role, "DownloadData") && (
                <MDButton
                  color="success"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = current.TepDinhKem;
                    link.download = current.TepDinhKem;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  Tải về
                </MDButton>
              )}
            </MDBox>
          ),
        };
      })
    );
  }
  useEffect(() => {
    fetchData();
  }, []);
  const columns = useMemo(() => COLUMNS, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await addData("Documents", e.target[0].value, {
      MaHoSo: e.target[0].value,
      NgayDeNghiDauNoi: convertDateTimeStringToVnTime(e.target[2].value),
      TenKhachHang: e.target[4].value,
      CongSuatDeNghi: e.target[6].value,
      NgayNopHoSoDayDu: convertDateTimeStringToVnTime(e.target[8].value),
      TepDinhKemLucTaoHoSo: e.target[10].value,
      TaoBoi: user ? user.user : "",
      NgayTao: getCurrentDate(),
      DonVi: user.branch,
    });
    if (result.includes("thành công")) {
      fetchData();
      toast.success(result, {
        autoClose: 3000,
        closeOnClick: true,
        position: "bottom-right",
      });
    } else {
      toast.error(result, {
        autoClose: 3000,
        closeOnClick: true,
        position: "bottom-right",
      });
    }
  };

  return (
    <MDBox mt={3} style={{ height: "100vh" }}>
      {rolePermissionRule(user.role, "CreateDocument") && (
        <MDBox mb={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox
              mb={2}
              display="grid"
              gridTemplateColumns="35% 35% 30%"
              style={{
                gridGap: "10px",
                paddingRight: "40px",
                boxSizing: "border-box",
              }}
            >
              <MDBox mb={2} style={{ gridColumn: "1 / span 1" }}>
                <UploadFileDialog
                  label="Tệp báo cáo tổng hợp"
                  order={0}
                  fileCount={2}
                />
              </MDBox>
              <MDBox mb={2} style={{ gridColumn: "2 / span 1" }}>
                <UploadFileDialog
                  label="Tệp báo cáo người vay vốn"
                  order={1}
                  fileCount={2}
                />
              </MDBox>

              <MDBox mb={2} style={{ gridColumn: "3 / span 1" }}>
                <MDButton
                  variant="gradient"
                  color="info"
                  type="submit"
                  fullWidth
                >
                  Tạo báo cáo nội bộ
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>
      )}
      <MDBox mb={3}>
        <DataTable
          canSearch={true}
          table={{
            columns: COLUMNS,
            rows: data,
          }}
        />
      </MDBox>
      <ToastContainer position="bottom-right" limit={1} />
    </MDBox>
  );
}

export default CreateDocument;
