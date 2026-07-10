<%@ Page Title="" Language="C#" MasterPageFile="~/General/Master.master" AutoEventWireup="true"
    CodeFile="VehicleMaster.aspx.cs" Inherits="Master_VehicleMaster" %>

    <asp:Content ID="Content1" ContentPlaceHolderID="ctnHead" runat="Server">
        <script class="text/javascript">
            window.onload = function () {
                LoadBranches();
                getTbleDet();
            };

            function LoadBranches() {
                PageMethods.GetBranches(function (response) {
                    $("#cmb_Branch").html("<option value=''>System / Main</option>");
                    if (response && response.length > 0) {
                        $.each(response, function (key, val) {
                            $("#cmb_Branch").append("<option value='" + val.id + "'>" + val.name + "</option>");
                        });
                    }
                });
            }

            function masterLoad(Mode, vehicleNumber, shortName, vehicleName, openingKm, tankCapacity, expectedMileage, ownershipType, status, branchId) {
                $("#modal-default").modal('show');
                $("#hf_Mode").val(Mode);
                $("#btn_Submit").attr("disabled", false);

                if (Mode == 'A') {
                    $("#modal_title").text("Add Vehicle Profile");
                    $("#txt_VehicleNumber").val("").attr("disabled", false);
                    $("#txt_ShortName").val("");
                    $("#txt_VehicleName").val("");
                    $("#txt_OpeningKm").val("0").attr("disabled", false);
                    $("#txt_TankCapacity").val("0");
                    $("#txt_ExpectedMileage").val("");
                    $("#cmb_OwnershipType").val("own");
                    $("#cmb_Status").val("active");
                    $("#cmb_Branch").val("");

                    PageMethods.GetNextShortName(function (nextName) {
                        $("#txt_ShortName").val(nextName);
                    });
                } else {
                    $("#modal_title").text("Edit Vehicle Profile");
                    $("#txt_VehicleNumber").val(vehicleNumber).attr("disabled", true);
                    $("#txt_ShortName").val(shortName);
                    $("#txt_VehicleName").val(vehicleName);
                    $("#txt_OpeningKm").val(openingKm).attr("disabled", true);
                    $("#txt_TankCapacity").val(tankCapacity);
                    $("#txt_ExpectedMileage").val(expectedMileage || "");
                    $("#cmb_OwnershipType").val(ownershipType);
                    $("#cmb_Status").val(status);
                    $("#cmb_Branch").val(branchId || "");
                }
            }

            function mandatoryValidation() {
                $("#btn_Submit").attr("disabled", true);
                var vNum = $("#txt_VehicleNumber").val().trim();
                var vName = $("#txt_VehicleName").val().trim();
                var sName = $("#txt_ShortName").val().trim();
                var openingKm = parseFloat($("#txt_OpeningKm").val());
                var tankCap = parseFloat($("#txt_TankCapacity").val());
                var mileage = $("#txt_ExpectedMileage").val().trim() !== "" ? parseFloat($("#txt_ExpectedMileage").val()) : null;

                if (vNum.length === 0) {
                    swal("Attention!", "Enter Vehicle Number", "warning");
                    $("#btn_Submit").attr("disabled", false);
                    $("#txt_VehicleNumber").focus();
                    return;
                }
                if (vName.length === 0) {
                    swal("Attention!", "Enter Vehicle Name / Model", "warning");
                    $("#btn_Submit").attr("disabled", false);
                    $("#txt_VehicleName").focus();
                    return;
                }
                if (sName.length === 0) {
                    swal("Attention!", "Enter Short Name code", "warning");
                    $("#btn_Submit").attr("disabled", false);
                    $("#txt_ShortName").focus();
                    return;
                }
                if (isNaN(openingKm) || openingKm < 0) {
                    swal("Attention!", "Enter valid opening KM", "warning");
                    $("#btn_Submit").attr("disabled", false);
                    $("#txt_OpeningKm").focus();
                    return;
                }
                if (isNaN(tankCap) || tankCap < 0) {
                    swal("Attention!", "Enter valid tank capacity", "warning");
                    $("#btn_Submit").attr("disabled", false);
                    $("#txt_TankCapacity").focus();
                    return;
                }

                var branchId = $("#cmb_Branch").val();
                var branchName = branchId ? $("#cmb_Branch option:selected").text() : "";

                PageMethods.CreateOrUpdateVehicleProfile(
                    vNum, sName, vName, openingKm, tankCap, mileage,
                    $("#cmb_Status").val(), branchId, branchName, $("#cmb_OwnershipType").val(),
                    function (response) {
                        if (response.error) {
                            swal("Error", response.error, "error");
                            $("#btn_Submit").attr("disabled", false);
                        } else {
                            swal("Success", "Vehicle profile saved successfully!", "success");
                            $("#modal-default").modal('hide');
                            getTbleDet();
                        }
                    }
                );
            }

            function getTbleDet() {
                if ($.fn.DataTable.isDataTable('#tbl_Vehicles')) {
                    $("#tbl_Vehicles").DataTable().destroy();
                }
                $("#tbl_bdy_Vehicles").html("");

                PageMethods.GetVehicles(function (response) {
                    if (response && response.length > 0) {
                        $.each(response, function (key, val) {
                            var isProfile = val.isProfile;

                            var actionsHtml = '';
                            if (isProfile) {
                                actionsHtml = '<a href="#" onclick="editVehicle(' + key + ')" class="btn btn-default btn-xs"><i class="fa fa-pencil"></i></a>'
                                    + '<a href="#" onclick="deleteVehicle(\'' + val.vehicleNumber + '\')" class="btn btn-default btn-xs"><i class="fa fa-trash"></i></a>';
                            } else {
                                actionsHtml = '<a href="#" onclick="createProfileFromDefault(\'' + val.vehicleNumber + '\')" class="btn btn-primary btn-xs">Setup Profile</a>';
                            }

                            // Escape values for JS parameters
                            var vNum = val.vehicleNumber.replace(/'/g, "\\'");
                            var sName = val.shortName.replace(/'/g, "\\'");
                            var vName = val.vehicleName.replace(/'/g, "\\'");
                            var bId = val.branch || '';

                            var row = '<tr style="font-size:smaller;text-align:left;" id="row_' + key + '">'
                                + '<td style="vertical-align:center;text-align:center;">' + (key + 1) + '</td>'
                                + '<td style="vertical-align:center;font-weight:bold;">' + val.vehicleNumber + '</td>'
                                + '<td style="vertical-align:center;">' + val.vehicleName + '</td>'
                                + '<td style="vertical-align:center;">' + val.shortName + '</td>'
                                + '<td style="vertical-align:center;text-transform:uppercase;">' + val.ownershipType + '</td>'
                                + '<td style="vertical-align:center;text-align:right;">' + val.tankCapacity + ' L</td>'
                                + '<td style="vertical-align:center;text-align:right;">' + (val.expectedMileage || '') + ' Km/L</td>'
                                + '<td style="vertical-align:center;text-align:center;text-transform:uppercase;">'
                                + '<span class="label label-' + (val.status === 'active' ? 'success' : 'danger') + '">' + val.status + '</span>'
                                + '</td>'
                                + '<td style="text-align:center;">' + actionsHtml + '</td>'

                                // Hidden parameters for editing
                                + '<td style="display:none;" id="p_openingKm_' + key + '">' + val.openingKm + '</td>'
                                + '<td style="display:none;" id="p_branchId_' + key + '">' + bId + '</td>'
                                + '</tr>';

                            $("#tbl_bdy_Vehicles").append(row);
                        });

                        $('#tbl_Vehicles').DataTable({
                            'paging': true,
                            'lengthChange': true,
                            'searching': true,
                            'ordering': true,
                            'info': true,
                            'autoWidth': false
                        });
                    }
                });
            }

            function editVehicle(idx) {
                var row = $("#row_" + idx);
                var vNum = row.find("td:eq(1)").text();
                var vName = row.find("td:eq(2)").text();
                var sName = row.find("td:eq(3)").text();
                var ownType = row.find("td:eq(4)").text().toLowerCase();
                var tankCap = parseFloat(row.find("td:eq(5)").text());
                var mileage = row.find("td:eq(6)").text();
                mileage = mileage === '—' ? '' : parseFloat(mileage);
                var status = row.find("td:eq(7)").text().trim().toLowerCase();
                var openingKm = parseFloat($("#p_openingKm_" + idx).text());
                var branchId = $("#p_branchId_" + idx).text();

                masterLoad('E', vNum, sName, vName, openingKm, tankCap, mileage, ownType, status, branchId);
            }

            function createProfileFromDefault(vehicleNumber) {
                masterLoad('A', vehicleNumber, '', '', 0, 0, '', 'own', 'active', '');
                $("#txt_VehicleNumber").val(vehicleNumber);
            }

            function deleteVehicle(vehicleNumber) {
                swal({
                    title: "Are you sure?",
                    text: "Do you want to delete vehicle profile " + vehicleNumber + "?",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                }).then(function (willDelete) {
                    if (willDelete) {
                        PageMethods.DeleteVehicleProfile(vehicleNumber, function (response) {
                            if (response.error) {
                                swal("Error", response.error, "error");
                            } else {
                                swal("Deleted!", "Vehicle profile has been deleted.", "success");
                                getTbleDet();
                            }
                        });
                    }
                });
            }
        </script>
    </asp:Content>

    <asp:Content ID="Content2" ContentPlaceHolderID="ctnForm" runat="Server">
        <input type="hidden" id="hf_Mode" />
        <div class="content-wrapper">
            <section class="content-header">
                <h1>Vehicle Profiles
                    <small>Configuration</small>
                </h1>
                <ol class="breadcrumb">
                    <li><a href="../General/Dashboard.aspx"><i class="fa fa-dashboard"></i>Home</a></li>
                    <li class="active">Vehicles</li>
                    <li><a href="#" onclick="masterLoad('A')"><i class="fa fa-plus"></i>Add Profile</a></li>
                </ol>
            </section>

            <section class="content">
                <div class="row">
                    <div class="col-xs-12">
                        <div class="box box-primary">
                            <div class="box-body">
                                <table id="tbl_Vehicles" class="table table-bordered table-hover">
                                    <thead>
                                        <tr>
                                            <th style="text-align: center; width: 1%">#</th>
                                            <th style="text-align: center; width: 12%">Vehicle Number</th>
                                            <th style="text-align: center; width: 20%">Vehicle Name</th>
                                            <th style="text-align: center; width: 8%">Short Code</th>
                                            <th style="text-align: center; width: 10%">Ownership</th>
                                            <th style="text-align: center; width: 12%">Tank Capacity</th>
                                            <th style="text-align: center; width: 12%">Exp. Mileage</th>
                                            <th style="text-align: center; width: 10%">Status</th>
                                            <th style="text-align: center; width: 15%">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tbl_bdy_Vehicles"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add/Edit Modal -->
                <div id="modal-default" class="modal fade" role="dialog">
                    <div class="modal-dialog modal-md">
                        <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span></button>
                                <h4 class="modal-title" id="modal_title">Vehicle Profile</h4>
                            </div>
                            <div class="modal-body">
                                <div class="row">
                                    <div class="form-group col-md-6">
                                        <label for="txt_VehicleNumber">Vehicle Registration Number *</label>
                                        <input type="text" id="txt_VehicleNumber" class="form-control text-uppercase"
                                            placeholder="e.g. TN01AB1234" maxlength="15" />
                                    </div>
                                    <div class="form-group col-md-6">
                                        <label for="txt_ShortName">Short Code *</label>
                                        <input type="text" id="txt_ShortName" class="form-control" placeholder="e.g. v1"
                                            maxlength="10" />
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="form-group col-md-6">
                                        <label for="txt_VehicleName">Vehicle Make & Model *</label>
                                        <input type="text" id="txt_VehicleName" class="form-control"
                                            placeholder="e.g. Ashok Leyland Dost" maxlength="100" />
                                    </div>
                                    <div class="form-group col-md-6">
                                        <label for="cmb_OwnershipType">Ownership Type</label>
                                        <select id="cmb_OwnershipType" class="form-control">
                                            <option value="own">Owned</option>
                                            <option value="rental">Rental</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="form-group col-md-6">
                                        <label for="txt_TankCapacity">Tank Capacity (Litres) *</label>
                                        <input type="number" step="0.1" id="txt_TankCapacity" class="form-control"
                                            value="0" />
                                    </div>
                                    <div class="form-group col-md-6">
                                        <label for="txt_ExpectedMileage">Expected Mileage (Km/Litre)</label>
                                        <input type="number" step="0.01" id="txt_ExpectedMileage" class="form-control"
                                            placeholder="Optional" />
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="form-group col-md-6">
                                        <label for="txt_OpeningKm">Odometer Opening KM *</label>
                                        <input type="number" step="1" id="txt_OpeningKm" class="form-control"
                                            value="0" />
                                    </div>
                                    <div class="form-group col-md-6">
                                        <label for="cmb_Branch">Assigned Location</label>
                                        <select id="cmb_Branch" class="form-control"></select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="form-group col-md-6">
                                        <label for="cmb_Status">Status</label>
                                        <select id="cmb_Status" class="form-control">
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-default pull-left"
                                    data-dismiss="modal">Close</button>
                                <button type="button" id="btn_Submit" class="btn btn-primary"
                                    onclick="mandatoryValidation()">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </asp:Content>