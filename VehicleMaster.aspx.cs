using System;
using System.Collections.Generic;
using System.Web;
using System.Web.Services;

public partial class Master_VehicleMaster : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (Session["UserId"] == null)
        {
            Response.Redirect("~/Login.aspx");
        }
    }

    [WebMethod]
    public static object GetVehicles()
    {
        return clsVehicleProfile.GetVehicles();
    }

    [WebMethod(EnableSession = true)]
    public static object CreateOrUpdateVehicleProfile(
        string vehicleNumber, string shortName, string vehicleName, 
        double openingKm, double tankCapacity, double? expectedMileage, 
        string status, string branch, string branchName, string ownershipType)
    {
        string username = HttpContext.Current.Session["UserName"] != null ? HttpContext.Current.Session["UserName"].ToString() : "system";
        string res = clsVehicleProfile.CreateOrUpdateVehicleProfile(
            vehicleNumber, shortName, vehicleName, openingKm, tankCapacity, expectedMileage, status, branch, branchName, ownershipType, username);
        if (res == "success")
        {
            var profile = clsVehicleProfile.FindMatchedProfile(vehicleNumber);
            return new { success = true, profile = profile };
        }
        return new { error = res };
    }

    [WebMethod]
    public static object DeleteVehicleProfile(string vehicleNumber)
    {
        string res = clsVehicleProfile.DeleteVehicleProfile(vehicleNumber);
        if (res == "success") return new { success = true };
        return new { error = res };
    }

    [WebMethod]
    public static object GetBranches()
    {
        return clsBranch.GetBranches();
    }

    [WebMethod]
    public static string GetNextShortName()
    {
        return clsVehicleProfile.GetNextShortName();
    }
}
