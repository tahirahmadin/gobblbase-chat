import React, { useEffect, useState } from "react";
import {
  inviteTeamMember,
  getTeamInvites,
  acceptOrRejectInvite,
} from "../../../../lib/serverActions";
import { useAdminStore } from "../../../../store/useAdminStore";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Copy, Plus, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useUserStore } from "../../../../store/useUserStore";

// Available roles (you can extract this from your membersRole data)
const availableRoles = [
  {
    label: "Super Admin",
    tag: "owner",
    value: "Everything",
  },
  {
    label: "Admin",
    tag: "admin",
    value: "Everything Except Billing",
  },
  {
    label: "Member",
    tag: "member",
    value: "Everything Except Billing & Team Management",
  },
];

// Function to get available roles based on current user's role
const getAvailableRolesForUser = (userRole: string) => {
  if (userRole === "Super Admin") {
    return availableRoles; // Super Admin can assign all roles
  } else if (userRole === "Admin") {
    return availableRoles.filter((role) => role.label !== "Super Admin"); // Admin can assign Admin and Member roles
  } else {
    return availableRoles.filter((role) => role.label === "Member"); // Regular members can only assign Member role
  }
};

const Team = () => {
  // IMPORTS & HOOKS
  const { activeTeamId, adminId } = useAdminStore();
  const { userEmail } = useUserStore();
  const { clientData, clientUsage } = useAdminStore();
  const navigate = useNavigate();

  // Function to check if remove button should be disabled
  const isRemoveButtonDisabled = (memberRole: string, memberEmail: string) => {
    const currentUserRole = clientData?.role || "Member";
    const currentUserEmail = userEmail;

    // User can't remove themselves
    if (memberEmail === currentUserEmail) {
      return true;
    }

    // Super Admin can remove anyone except themselves
    if (currentUserRole === "Super Admin") {
      return false;
    }

    // Admin can't remove Super Admin
    if (currentUserRole === "Admin" && memberRole === "Super Admin") {
      return true;
    }

    // Member can't remove Admin or Super Admin
    if (
      currentUserRole === "Member" &&
      (memberRole === "Admin" || memberRole === "Super Admin")
    ) {
      return true;
    }

    return false;
  };

  const [newMembers, setNewMembers] = useState<
    Array<{
      id: string;
      role: string;
      dropdownOpen: boolean;
      email?: string;
      loading?: boolean;
    }>
  >([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [showAddMemberPanel, setShowAddMemberPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get filtered roles based on current user's role
  const filteredRoles = getAvailableRolesForUser(clientData?.role || "Member");

  // NAVIGATION FUNCTIONS
  const navigateToPlans = () => {
    navigate("/admin/account/plans");
  };

  useEffect(() => {
    const fetchInvites = async () => {
      if (!activeTeamId) return;
      try {
        const res = await getTeamInvites(activeTeamId || "");
        setInvites(res || []);
      } catch (e) {
        setInvites([]);
      }
    };
    fetchInvites();
  }, [activeTeamId]);

  // Add a new member input section
  const handleAddNewMember = () => {
    const newMember = {
      id: `new-member-${Date.now()}`,
      role: "Member", // Default role is now Member
      dropdownOpen: false,
      email: "",
      loading: false,
    };
    setNewMembers((prev) => [...prev, newMember]);
  };

  // Handle role change for a specific new member
  const handleNewMemberRoleChange = (
    memberId: string,
    newRoleLabel: string
  ) => {
    // Validate if the user has permission to assign this role
    const userRole = clientData?.role || "Member";
    if (userRole === "Admin" && newRoleLabel === "Super Admin") {
      toast.error("You do not have permission to assign Super Admin role");
      return;
    }
    if (userRole === "Member" && newRoleLabel !== "Member") {
      toast.error(
        "You do not have permission to assign Admin or Super Admin roles"
      );
      return;
    }

    setNewMembers((prev) =>
      prev.map((member) =>
        member.id === memberId
          ? { ...member, role: newRoleLabel, dropdownOpen: false }
          : member
      )
    );
  };

  // Toggle dropdown for a specific new member (closes others)
  const toggleNewMemberDropdown = (memberId: string) => {
    setNewMembers((prev) =>
      prev.map(
        (member) =>
          member.id === memberId
            ? { ...member, dropdownOpen: !member.dropdownOpen }
            : { ...member, dropdownOpen: false } // Close other dropdowns
      )
    );
  };

  // Accept invite handler (mock)
  const handleInviteAction = async (
    invite: any,
    status: "accepted" | "rejected"
  ) => {
    try {
      if (!activeTeamId || !adminId) return;
      const res = await acceptOrRejectInvite({
        teamId: activeTeamId,
        adminId: adminId,
        email: invite.email,
        inviteStatus: status,
        teamName: invite.teamName,
      });
      if (!res.error) {
        toast.success(
          `Invite ${status === "accepted" ? "accepted" : "rejected"} for ${
            invite.email
          }`
        );
        // Optionally refresh invites
        const updated = await getTeamInvites(activeTeamId || "");
        setInvites(updated || []);
      } else {
        toast.error(res.result || `Failed to ${status} invite`);
      }
    } catch (err) {
      toast.error(`Failed to ${status} invite`);
    }
  };

  return (
    <section className="h-full overflow-x-hidden">
      {console.log(clientData)}
      {console.log(isRemoveButtonDisabled)}
      {/* upper side title and toggle btn  */}
      <div className="upper px-12 pt-12">
        <h2 className="text-2xl font-semibold text-gray-900">Team</h2>
        <p className="text-gray-600">
          Manage your team members, assign roles and invite new collaborators
        </p>
        <div className="flex flex-wrap gap-4 mb-6 w-full mt-8">
          {/* Current Plan */}
          <div className="bg-[#CEFFDC] rounded-lg p-4 justify-between w-[380px]">
            <span className="text-[0.9rem] text-gray-600">Current Plan</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[1.2rem]">
                {clientUsage?.usage?.planId || "-"}
              </span>
              <div className="relative z-10">
                <div className="absolute top-[4px] left-[4px] -z-10 bg-[#6AFF97] border border-black w-full h-full"></div>
                <button
                  onClick={navigateToPlans}
                  className="bg-[#6AFF97] border border-black text-black font-semibold px-4 py-1"
                >
                  VIEW
                </button>
              </div>
            </div>
          </div>

          {/* Team members */}
          <div className="bg-[#D4DEFF] rounded-lg p-4 flex items-end gap-4 flex justify-between w-[500px]">
            <div className="team-member-bar w-full">
              <div className="flex items-center mb-2 whitespace-nowrap">
                <span className="text-2xl font-bold mr-2">
                  {clientData?.teamMembers?.length}
                </span>
                <span className="text-gray-700">
                  /10 <span>Team Members</span>
                </span>
              </div>
              <div className="w-full h-3 bg-white rounded-full shadow-[inset_0_3px_3px_0_rgba(0,0,0,0.25)]">
                <div
                  className="h-3   bg-[#4D65FF] border border-black rounded-full"
                  style={{
                    width: `${10 > 0 ? 20 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="relative z-10">
              <div className="absolute top-[4px] left-[4px] -z-10 bg-[#6AFF97] border border-black w-full h-full"></div>
              <button
                onClick={() => setShowAddMemberPanel(true)}
                className="whitespace-nowrap flex items-center gap-2 bg-[#6AFF97] border border-black text-black font-semibold px-4 py-1"
              >
                <span className="icon">
                  <Plus className="h-4 w-4 text-black" />
                </span>
                <span className="text">NEW MEMBER</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Team manage table  */}
      <div className="middle px-12 pt-6">
        <div className="bg-[#EEEEEE] border border-gray-200 p-6 rounded-lg">
          <div className=" h-[100%] overflow-y-auto">
            {/* products manage in mob  table for large file  */}
            <div className="hidden md:block">
              <table className="w-full min-w-[500px] border-separate border-spacing-y-2">
                <thead className="sticky top-0  rounded-t-lg bg-[#CEFFDC] z-5 ">
                  <tr className="">
                    <th className="py-1.5 px-2 text-left text-sm rounded-l-[12px] text-center">
                      TEAM MEMBER
                    </th>
                    <th className="py-1.5 px-2 text-left text-sm text-center">
                      EMAIL
                    </th>
                    <th className="py-1.5 px-2 text-left text-sm text-center">
                      ASSIGNED ROLE
                    </th>

                    <th className=" py-1.5 px-2 text-left text-sm rounded-r-[12px] text-center">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-sm">
                        Loading...
                      </td>
                    </tr>
                  ) : !clientData?.teamMembers ||
                    clientData.teamMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-sm">
                        No team members found.
                      </td>
                    </tr>
                  ) : (
                    clientData.teamMembers.map((member) => (
                      <tr key={member.email} className="border-t text-center">
                        <td className="py-1.5 px-12 text-sm text-left rounded-l-[12px]">
                          <div className="flex items-center gap-1.5 justify-start ">
                            {/* No avatar/name in API, just show email prefix as name */}
                            <div className="uppercase text-[0.9rem]">
                              {member.email.split("@")[0]}
                            </div>
                          </div>
                        </td>
                        <td className="py-1.5 px-2 text-sm text-center">
                          {member.email}
                        </td>
                        <td className="py-1.5 px-12 text-sm text-left rounded-l-[12px]">
                          <div className="flex items-center gap-1.5 justify-start ">
                            {/* No avatar/name in API, just show email prefix as name */}
                            <div className="uppercase text-[0.9rem]">
                              {member.role}
                            </div>
                          </div>
                        </td>
                        <td className="py-1.5 px-2 rounded-r-[12px] ">
                          <div className="flex gap-1.5 items-center justify-center">
                            <button
                              className={`bg-[#FF9797] text-[#000] w-24 py-2 rounded-full border border-[#000] text-sm ${
                                isRemoveButtonDisabled(
                                  member.role,
                                  member.email
                                )
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={isRemoveButtonDisabled(
                                member.role,
                                member.email
                              )}
                              onClick={() => {
                                if (
                                  !isRemoveButtonDisabled(
                                    member.role,
                                    member.email
                                  )
                                ) {
                                  // Add your remove member logic here
                                }
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Invites Table */}
        <div className="bg-[#FFFBEA] border border-yellow-300 p-6 rounded-lg mt-8">
          <h3 className="text-lg font-bold mb-4">Pending Invites</h3>
          <table className="w-full min-w-[400px] border-separate border-spacing-y-4">
            <thead>
              <tr>
                <th className="py-1.5 px-2 text-left text-sm">Team Name</th>
                <th className="py-1.5 px-2 text-left text-sm">Email</th>
                <th className="py-1.5 px-2 text-left text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {invites.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-sm">
                    No invites found.
                  </td>
                </tr>
              ) : (
                invites.map((invite, idx) => (
                  <tr
                    key={invite.email || idx}
                    className="bg-white border border-gray-300 rounded-lg shadow-md"
                    style={{
                      boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                      borderRadius: 12,
                    }}
                  >
                    <td className="py-3 px-4 font-semibold text-base text-gray-800 rounded-l-lg">
                      {invite.teamName || "Unknown Team"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {invite.email}
                    </td>
                    <td className="py-3 px-4 rounded-r-lg flex gap-2 items-center justify-center">
                      <button
                        className="bg-[#6AFF97] border border-black px-4 py-2 rounded text-black font-semibold hover:bg-[#4D65FF] hover:text-white transition-colors shadow"
                        onClick={() => handleInviteAction(invite, "accepted")}
                      >
                        Accept
                      </button>
                      <button
                        className="bg-[#FF9797] border border-black px-4 py-2 rounded text-black font-semibold hover:bg-[#FF4D4D] hover:text-white transition-colors shadow"
                        onClick={() => handleInviteAction(invite, "rejected")}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="below px-12 pt-6">
        <button
          className="new-member flex items-center gap-2"
          onClick={() => setShowAddMemberPanel(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="main-font text-[1.2rem]">New Member</span>
        </button>

        {showAddMemberPanel && (
          <div className="new-member-section">
            {/* New Member Role Selection */}
            <div className="new-member-role z-20 mt-4 mb-6 flex items-center gap-4 w-1/2 border border-[#000] p-4 rounded-lg relative">
              {/* Close button */}
              <button
                onClick={() => setShowAddMemberPanel(false)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-[1.2rem] font-semibold text-gray-800">
                Assign Role
              </h3>
              <div className="relative w-64 flex items-center">
                <div
                  className="relative w-full px-3 py-2 border border-[#7D7D7D] text-sm focus:outline-none rounded-sm flex justify-between items-center bg-white cursor-pointer"
                  onClick={() => {
                    if (!newMembers.length) {
                      handleAddNewMember();
                    }
                    toggleNewMemberDropdown(
                      newMembers[0]?.id || "panel-member"
                    );
                  }}
                >
                  {newMembers[0]?.role || "Member"}
                </div>
                <div className="icon bg-[#AEB8FF] px-2 py-2 border border-[#7D7D7D] border-l-0 rounded-r-sm">
                  <ChevronDown
                    size={20}
                    className={`text-[#000000] stroke-[3px] transition-transform ${
                      newMembers[0]?.dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {newMembers[0]?.dropdownOpen && (
                  <div className="absolute z-10 mt-1 top-12 w-full bg-white border border-[#7D7D7D] shadow-lg rounded-sm">
                    {filteredRoles.map((roleOption) => (
                      <div
                        key={roleOption.value}
                        onClick={() =>
                          handleNewMemberRoleChange(
                            newMembers[0]?.id || "panel-member",
                            roleOption.label
                          )
                        }
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-100 transition-colors flex flex-col cursor-pointer ${
                          newMembers[0]?.role === roleOption.label
                            ? "bg-[#AEB8FF]"
                            : ""
                        }`}
                      >
                        <span className="text-gray-800 font-medium">
                          {roleOption.label}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {roleOption.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* New Member Invite */}
            <div className="new-member-invite mt-4 mb-6 flex items-center gap-4 w-1/2 border border-[#000] py-10 px-6 rounded-lg">
              <div className="view-email flex flex-col gap-2 w-full">
                <h3 className="text-[1.2rem] font-semibold text-gray-800">
                  Invite people via email
                </h3>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-[#7D7D7D] text-sm focus:outline-none rounded-sm bg-white"
                  placeholder="Enter email address"
                  value={newMembers[0]?.email || ""}
                  onChange={(e) => {
                    const email = e.target.value;
                    setNewMembers((prev) =>
                      prev.map((m, i) => (i === 0 ? { ...m, email } : m))
                    );
                  }}
                />
                <div className="relative mt-4 z-10 w-fit flex justify-center mx-auto">
                  <div className="absolute top-[4px] left-[4px] -z-10 bg-[#6AFF97] w-full h-full border border-black"></div>
                  <button
                    className="bg-[#6AFF97] min-w-[100px] relative z-10 text-black px-4 py-2 border border-black"
                    disabled={newMembers[0]?.loading}
                    onClick={async () => {
                      if (!newMembers[0]?.email) {
                        alert("Please enter an email address.");
                        return;
                      }
                      setNewMembers((prev) =>
                        prev.map((m, i) =>
                          i === 0 ? { ...m, loading: true } : m
                        )
                      );
                      try {
                        const res = await inviteTeamMember({
                          teamId: activeTeamId,
                          adminId: adminId,
                          email: newMembers[0].email,
                          role: newMembers[0].role,
                        });
                        if (!res.error) {
                          toast.success("Invite email sent!");
                          setShowAddMemberPanel(false);
                        } else {
                          toast.error(res.result || "Failed to invite member");
                        }
                      } catch (err) {
                        toast.error("Failed to invite member");
                      } finally {
                        setNewMembers((prev) =>
                          prev.map((m, i) =>
                            i === 0 ? { ...m, loading: false } : m
                          )
                        );
                      }
                    }}
                  >
                    {newMembers[0]?.loading ? "Inviting..." : "Invite"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Team;
