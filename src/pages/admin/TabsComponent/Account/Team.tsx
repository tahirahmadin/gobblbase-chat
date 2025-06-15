import React, { useEffect, useState } from "react";
import {
  inviteTeamMember,
  getTeamInvites,
  acceptOrRejectInvite,
  removeTeamMember,
} from "../../../../lib/serverActions";
import { useAdminStore } from "../../../../store/useAdminStore";

import { Plus, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useUserStore } from "../../../../store/useUserStore";

const Team = () => {
  // IMPORTS & HOOKS
  const { activeTeamId, adminId, refetchClientData } = useAdminStore();
  const { clientData, clientUsage } = useAdminStore();

  // Function to check if remove button should be disabled
  const isRemoveButtonDisabled = () => {
    return adminId !== activeTeamId;
  };

  const [newMembers, setNewMembers] = useState<
    Array<{
      id: string;
      email: string;
      loading: boolean;
    }>
  >([
    {
      id: `new-member-${Date.now()}`,
      email: "",
      loading: false,
    },
  ]);
  const [invites, setInvites] = useState<any[]>([]);
  const [showAddMemberPanel, setShowAddMemberPanel] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Handle invite submission
  const handleInviteSubmit = async () => {
    if (!newMembers[0]?.email) {
      toast.error("Please enter an email address.");
      return;
    }

    setNewMembers((prev) =>
      prev.map((member, index) =>
        index === 0 ? { ...member, loading: true } : member
      )
    );

    try {
      const res = await inviteTeamMember({
        teamId: activeTeamId,
        adminId: adminId,
        email: newMembers[0].email,
        role: "Member",
      });

      if (!res.error) {
        toast.success("Invite email sent!");
        refetchClientData();
        setShowAddMemberPanel(false);
        setNewMembers([
          {
            id: `new-member-${Date.now()}`,
            email: "",
            loading: false,
          },
        ]);
      } else {
        toast.error(res.result || "Failed to invite member");
      }
    } catch (err) {
      toast.error("Failed to invite member");
    } finally {
      setNewMembers((prev) =>
        prev.map((member, index) =>
          index === 0 ? { ...member, loading: false } : member
        )
      );
    }
  };

  // Accept invite handler (mock)
  const handleInviteAction = async (
    invite: any,
    status: "accepted" | "rejected"
  ) => {
    try {
      if (!activeTeamId || !adminId) return;
      const res = await acceptOrRejectInvite({
        adminId: adminId,
        teamId: activeTeamId,
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
        refetchClientData();
        setInvites(updated || []);
      } else {
        toast.error(res.result || `Failed to ${status} invite`);
      }
    } catch (err) {
      toast.error(`Failed to ${status} invite`);
    }
  };

  // Remove team member handler
  const handleRemoveTeamMember = async (member: any) => {
    if (isRemoveButtonDisabled()) return;
    setLoading(true);
    try {
      const res = await removeTeamMember({
        teamId: activeTeamId || "",
        email: member.email,
        adminId: adminId || "",
      });
      if (!res.error) {
        toast.success("Team member removed!");
        refetchClientData();
      } else {
        toast.error(res.result || "Failed to remove member");
      }
    } catch (err) {
      toast.error("Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="h-full overflow-x-hidden">
      {/* upper side title and toggle btn  */}
      <div className="upper px-4 md:px-12 pt-12">
        <h2 className="text-2xl font-semibold text-gray-900">Team</h2>
        <p className="text-gray-600">
          Manage your team members, assign roles and invite new collaborators
        </p>

        <div className="flex flex-wrap gap-4 mb-6 w-full mt-8">
          {/* Current Plan */}
          {/* <div className="bg-[#CEFFDC] rounded-lg p-4 justify-between w-[380px]">
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
          </div> */}

          {/* Team members */}
          <div className="bg-[#D4DEFF] rounded-lg p-4 flex flex-col xs:flex-row items-end gap-4 flex justify-between min-w-[120px] w-full max-w-[450px]">
            <div className="team-member-bar w-full">
              <div className="flex items-center mb-2 whitespace-nowrap">
                <span className="text-2xl font-bold mr-2">
                  {clientData?.teamMembers?.length}
                </span>
                <span className="text-gray-700">
                  /25 <span>Team Members</span>
                </span>
              </div>
              <div className="w-full h-3 bg-white rounded-full shadow-[inset_0_3px_3px_0_rgba(0,0,0,0.25)]">
                <div
                  className="h-3  bg-[#4D65FF] border border-black rounded-full"
                  style={{
                    width: `${
                      clientData?.teamMembers?.length &&
                      clientData?.teamMembers?.length > 0
                        ? (clientData?.teamMembers?.length / 25) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="relative z-10">
              <div className="absolute top-[4px] left-[4px] -z-10 bg-[#6AFF97] border border-black w-full h-full"></div>
              <button
                onClick={() => setShowAddMemberPanel(!showAddMemberPanel)}
                disabled={adminId !== activeTeamId}
                className={`whitespace-nowrap flex items-center gap-2 bg-[#6AFF97] border border-black text-black font-semibold px-4 py-1 ${
                  adminId !== activeTeamId
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <span className="icon">
                  <Plus className="h-4 w-4 text-black" />
                </span>
                <span className="text">NEW </span>
                <span className="hidden md:flex">MEMBER</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="below px-4 md:px-12 pt-6 pb-12">
        {showAddMemberPanel && (
          <div className="new-member-section w-full">
            {/* New Member Invite */}
            <div className="relative new-member-invite w-full md:w-1/2 mt-4 mb-6 flex items-center gap-4 w-1/2 border border-[#000] py-10 px-6 rounded-lg">
              <button
                onClick={() => setShowAddMemberPanel(false)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
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
                    setNewMembers((prev) =>
                      prev.map((member, index) =>
                        index === 0
                          ? { ...member, email: e.target.value }
                          : member
                      )
                    );
                  }}
                />
                <div className="relative mt-4 z-10 w-fit flex justify-center mx-auto">
                  <div className="absolute top-[4px] left-[4px] -z-10 bg-[#6AFF97] w-full h-full border border-black"></div>
                  <button
                    className="bg-[#6AFF97] min-w-[100px] relative z-10 text-black px-4 py-2 border border-black"
                    disabled={newMembers[0]?.loading}
                    onClick={handleInviteSubmit}
                  >
                    {newMembers[0]?.loading ? "Inviting..." : "Invite"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Team manage table  */}
      <div className="middle px-4 md:px-12 pt-6 pb-12">
        <div className="bg-[#EEEEEE] w-full border border-gray-200 p-6 rounded-lg">
          <div className=" h-[100%] overflow-y-auto">
            <div className="block w-[200px] min-w-[100%]">
              <table className="border-separate  w-full min-w-[200px] border-spacing-y-2">
                <thead className="sticky top-0  rounded-t-lg bg-[#CEFFDC] z-5 ">
                  <tr className="">
                    <th className="py-1.5 px-6 text-left text-sm rounded-l-[12px] ">
                      TEAM MEMBER
                    </th>
                    <th className="py-1.5 px-2 text-left text-sm ">EMAIL</th>
                    <th className="py-1.5 px-2 text-left text-sm ">
                      ASSIGNED ROLE
                    </th>
                    <th className="py-1.5 px-2 text-left text-sm ">STATUS</th>

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
                    clientData.teamMembers
                      .sort((a, b) => a.status.localeCompare(b.status))
                      .map((member) => (
                        <tr key={member.email} className="border-t text-center">
                          <td className="py-1.5 px-6 text-sm text-left rounded-l-[12px]">
                            <div className="flex items-center gap-1.5 justify-start ">
                              {/* No avatar/name in API, just show email prefix as name */}
                              <div className="uppercase text-[0.9rem]">
                                {member.email.split("@")[0]}
                              </div>
                            </div>
                          </td>
                          <td className="py-1.5 px-2 text-sm text-left">
                            {member.email}
                          </td>
                          <td className="py-1.5 px-2 text-sm text-left ">
                            <div className="flex items-center gap-1.5 justify-start ">
                              {/* No avatar/name in API, just show email prefix as name */}
                              <div className="uppercase text-[0.9rem]">
                                {member.role}
                              </div>
                            </div>
                          </td>
                          <td className="py-1.5 px-2 text-sm text-left ">
                            <div className="flex items-center gap-1.5 justify-start ">
                              {/* No avatar/name in API, just show email prefix as name */}
                              <div className="uppercase text-[0.9rem]">
                                {member.status}
                              </div>
                            </div>
                          </td>
                          <td className="py-1.5 px-2 rounded-r-[12px]">
                            <div className="flex gap-1.5 items-center justify-center">
                              <button
                                className={`bg-[#FF9797] text-[#000] w-24 py-2 rounded-full border border-[#000] text-sm ${
                                  isRemoveButtonDisabled()
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                                disabled={isRemoveButtonDisabled()}
                                onClick={() => handleRemoveTeamMember(member)}
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
          <table className="w-full min-w-[200px] border-separate border-spacing-y-4">
            <thead>
              <tr>
                <th className="py-1.5 px-2 text-left text-sm">Invited By</th>
                <th className="py-1.5 px-2 text-left text-sm">Team Name</th>

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
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {invite.email}
                    </td>
                    <td className="py-3 px-4 font-semibold text-base text-gray-800 rounded-l-lg">
                      {invite.teamName || "Unknown Team"}
                    </td>

                    <td className="py-3 px-4 rounded-r-lg flex gap-2 items-center justify-start">
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
    </section>
  );
};

export default Team;
