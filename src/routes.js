import Report from "layouts/reports";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Tạo báo cáo",
    title: "Tạo báo cao",
    key: "Report",
    icon: <Icon fontSize="small">post_add</Icon>,
    route: "/taobaocao",
    component: <Report />,
    isPrivate: true,
    isCheckRole: false
  },
  {
    type: "collapse",
    name: "Đăng nhập",
    key: "SignIn",
    icon: <Icon fontSize="small">content_paste_go</Icon>,
    route: "/dangnhap",
    component: <SignIn />,
    isPrivate: false,
    isCheckRole: false
  }
  ,
  {
    type: "collapse",
    name: "Đăng ký",
    key: "SignUp",
    icon: <Icon fontSize="small">content_paste_go</Icon>,
    route: "/dangky",
    component: <SignUp />,
    isPrivate: true,
    isCheckRole: true
  }
];

export default routes;
