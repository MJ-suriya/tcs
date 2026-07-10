using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Text;
using System.Web.Services;

public partial class General_Master : System.Web.UI.MasterPage
{
    public String ConStr;
    DataSet Ds;
    General ObjGen = new General();
    clsDataAccess objDa;

    protected void Page_Init(object sender, EventArgs e)
    {
        if (Context.Session != null)
        {
            if (Session.IsNewSession)
            {
                HttpCookie newSessionIdCookie = Request.Cookies["ASP.NET_SessionId"];
                if (newSessionIdCookie != null)
                {
                    string newSessionIdCookieValue = newSessionIdCookie.Value;
                    if (newSessionIdCookieValue != string.Empty)
                    {
                        // This means Session was timed Out and New Session was started
                        Response.Redirect("~/General/SessionEnd.aspx");
                    }
                }
            }
        }
    }
    protected void Page_Load(object sender, EventArgs e)
    {
        Response.Cache.SetCacheability(HttpCacheability.NoCache);
        if (!IsPostBack)
        {
            if (HttpContext.Current.Session["UserId"] != null)
            {
                hf_UserId.Value = Session["UserId"].ToString();

                //string verifyPassword = Page.Request.Form["txt_VerifyLogin"].ToString(); 

                GenerateMenu(General.ValInt(hf_UserId.Value));
                //LoadCompany();
                //LoadDefaultCompany();
            }
            else
            {
                Response.Redirect("~/General/SessionEnd.aspx");
            }
        }
    }
    private void GenerateMenu(int userId)
    {        
        clsModule objMenu = new clsModule();
        List<clsModule> moduleList = new List<clsModule>();
        moduleList = objMenu.generateMenu(userId);
        StringBuilder strMenu = new StringBuilder();
        strMenu.Append("<ul class='sidebar-menu' style='background-color:#000D3A;' data-widget='tree'>");
        //  strMenu.Append("<li class='header'>MAIN NAVIGATION</li>");
        int i = 0;
        int ActModId = General.ValInt(Session["ActiveModuleId"]);
        int ActChapId = General.ValInt(Session["ActiveChapterId"]);
        int ActFunctionId = General.ValInt(Session["ActiveFunctionId"]);

        //strMenu.Append("<input type='text' id='txt_VerifyLogin' class='form-control' />");


        foreach (clsModule mod in moduleList)
        {
            //strMenu.Append("<li class='" + (i == 0 ? "active" : "") + " treeview'>"); //Commented by madhan.. master menu only loading..
            if (ActModId > 0)
            {
                if (ActModId == mod.moduleId)
                {
                    strMenu.Append("<li class='" + "active" + " treeview'>");
                }
                else
                {
                    strMenu.Append("<li class='" + (i == 0 ? "" : "") + " treeview'>");
                }
            }
            else
            {
                strMenu.Append("<li class='" + (i == 0 ? "" : "") + " treeview'>");
            }
            strMenu.Append("<a href='#'>");
            strMenu.Append("<i class='fa " + mod.moduleIcon + "'></i><span>" + mod.moduleName + "</span>");//#059A5F; style='Color: #fff'
            strMenu.Append("<span class='pull-right-container'>");
            strMenu.Append("<i class='fa fa-angle-left pull-right'></i>");
            strMenu.Append("</span>");
            strMenu.Append("</a>");
            strMenu.Append("<ul class='treeview-menu'>");
            foreach (clsChapter chap in mod.chapters)
            {
                //if (chap.functions.Count == 1)
                //{
                //    strMenu.Append("<a href='#' onclick='getFunctionId(\"" + chap.functions[0].url + "\"," + chap.functions[0].functionId + ")'> <small>" + chap.functions[0].functionName + "</small>");
                //}
                //else
                //{
                //    strMenu.Append("<li class='treeview'>");
                //    strMenu.Append("<a href='#'><i class='fa fa-plus-square'></i> <small>" + chap.chapterName + "</small>");
                //    strMenu.Append("<span class='pull-right-container'>");
                //    strMenu.Append("<i class='fa fa-angle-left pull-right'></i>");
                //    strMenu.Append("</span>");
                //    strMenu.Append("</a>");
                //    strMenu.Append("<ul class='treeview-menu'>");
                //    foreach (clsFunction func in chap.functions)
                //    {
                //        string url = func.url;
                //        strMenu.Append("<li><a href='#' id='lnk_' onclick='getFunctionId(\"" + url + "\"," + func.functionId + ")'><i class='fa fa-circle-o'></i><small>" + func.functionName + "</small></a></li>");
                //    }
                //    strMenu.Append("</ul>");
                //    strMenu.Append("</li>");
                //}

                if (chap.chapterType == "1")
                {
                    //strMenu.Append("<li class='treeview'>");
                    if (ActChapId > 0)
                    {
                        if (ActChapId == chap.chapterId)
                        {
                            strMenu.Append("<li class='" + "active" + " treeview'>");
                        }
                        else
                        {
                            strMenu.Append("<li class='" + (i == 0 ? "" : "") + " treeview'>");
                        }
                    }
                    else
                    {
                        strMenu.Append("<li class='" + (i == 0 ? "" : "") + " treeview'>");
                    }
                    strMenu.Append("<a href='#'><i class='fa fa-plus-square'></i> <small>" + chap.chapterName + "</small>");
                    strMenu.Append("<span class='pull-right-container'>");
                    strMenu.Append("<i class='fa fa-angle-left pull-right'></i>");
                    strMenu.Append("</span>");
                    strMenu.Append("</a>");
                    strMenu.Append("<ul class='treeview-menu'>");
                    foreach (clsFunction func in chap.functions)
                    {
                        string url = func.url;
                        if (ActFunctionId > 0)
                        {
                            if (ActFunctionId == func.functionId)
                            {
                                strMenu.Append("<li><a href='#' id='lnk_' onclick='getFunctionId(\"" + url + "\"," + func.functionId + "," + mod.moduleId + "," + chap.chapterId + ")'><i class='fa fa-circle-o'></i><b>" + func.functionName + "</b></a></li>");
                            }
                            else
                            {
                                strMenu.Append("<li><a href='#' id='lnk_' onclick='getFunctionId(\"" + url + "\"," + func.functionId + "," + mod.moduleId + "," + chap.chapterId + ")'><i class='fa fa-circle-o'></i><small>" + func.functionName + "</small></a></li>");
                            }
                        }
                        else
                        {
                            strMenu.Append("<li><a href='#' id='lnk_' onclick='getFunctionId(\"" + url + "\"," + func.functionId + "," + mod.moduleId + "," + chap.chapterId + ")'><i class='fa fa-circle-o'></i><small>" + func.functionName + "</small></a></li>");
                        }
                    }
                    strMenu.Append("</ul>");
                    strMenu.Append("</li>");
                }
                else
                {
                    foreach (clsFunction func in chap.functions)
                    {
                        string url = func.url;
                        if (ActFunctionId > 0)
                        {
                            if (ActFunctionId == func.functionId)
                            {
                                strMenu.Append("<li><a href='#' id='lnk_' onclick='getFunctionId(\"" + url + "\"," + func.functionId + "," + mod.moduleId + "," + 0 + ")'><i class='fa fa-circle-o'></i><b>" + func.functionName + "</b></a></li>");
                            }
                            else
                            {
                                strMenu.Append("<li><a href='#' id='lnk_' onclick='getFunctionId(\"" + url + "\"," + func.functionId + "," + mod.moduleId + "," + 0 + ")'><i class='fa fa-circle-o'></i><small>" + func.functionName + "</small></a></li>");
                            }
                        }
                        else
                        {
                            strMenu.Append("<li><a href='#' id='lnk_' onclick='getFunctionId(\"" + url + "\"," + func.functionId + "," + mod.moduleId + "," + 0 + ")'><i class='fa fa-circle-o'></i><small>" + func.functionName + "</small></a></li>");
                        }
                    }
                }
            }
            strMenu.Append("</ul>");
            strMenu.Append("</li>");
            i = i + 1;
        }
        strMenu.Append("</ul>");
        mnuList.InnerHtml = strMenu.ToString();
    }
    private void LoadDefaultCompany()
    {
        objDa = new clsDataAccess((Session["dbConnection"].ToString() == "ERP" ? clsDataAccess.dbConnection.defaultConnection : clsDataAccess.dbConnection.defaultConnection));
        //objCom.bindHtmlSelect(ref cmbCompany, "Select CompanyId,Company From Company", "");
        DataSet Ds = new DataSet();
        if (General.ValInt(Session["CompanyId"]) == 0)
        {
            Ds = objDa.GetDataSet("NewErp_Sp_Sel_LoadDefaultCompany @UserId=" + General.ValInt(Session["UserId"]));

            Session["Company"] = Ds.Tables[0].Rows[0]["Company"].ToString();
            Session["CompanyId"] = General.ValInt(Ds.Tables[0].Rows[0]["CompanyId"]);
            Response.Cookies["CompanyId"].Value = Convert.ToString(General.ValInt(Ds.Tables[0].Rows[0]["CompanyId"]));
        }
        //txtCompany.InnerHtml = Session["Company"].ToString();
    }
    protected void lnkLogout_Click(object sender, EventArgs e)
    {
        try
        {
            RemoveUser();
        }
        catch (Exception) { }
        if (General.ValStr(Session["AdminLogin"]) == "Y")
        {
            Response.Redirect(Session["LocalURL"] + "AdminLogin.aspx");
        }
        else
        {
            Response.Redirect((Session["loginType"].ToString() == "ERP" ? "Login.aspx" : "../General/hrmsLogin.aspx"));
        }
    }
    void RemoveUser()
    {
        Session.Abandon();
    }
    [System.Web.Services.WebMethod]
    public static int setFunctionId(int functionId)
    { 
        HttpContext.Current.Session["FunctionId"] = functionId;
        return functionId;
    }
    [System.Web.Services.WebMethod]
    public static string getVerifyLogin(int UserId, string Password)
    {
        clsGrade objGrade = new clsGrade();
        string EncryptPass;
        EncryptPass = Business.UtilitySecurity.Encrypt(Password);
        return objGrade.duplicateGrade(UserId, EncryptPass);
    }
}