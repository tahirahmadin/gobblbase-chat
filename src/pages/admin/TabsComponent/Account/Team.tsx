import React, { useEffect, useState } from "react";
import {
  inviteTeamMember,
  getTeamInvites,
  acceptOrRejectInvite,
  removeTeamMember,
} from "../../../../lib/serverActions";
import { useAdminStore } from "../../../../store/useAdminStore";

import { Plus, X, Pencil } from "lucide-react";
import { toast } from "react-hot-toast";
import { useUserStore } from "../../../../store/useUserStore";

type TeamHeaderProps = {
  teamName: string;
  setTeamName: (name: string) => void;
  currentPlan: string;
  membersCount: number;
  membersLimit: number;
  onInvite: () => void;
  inviteEmail: string;
  setInviteEmail: (email: string) => void;
  inviteLoading: boolean;
};

const TeamHeader: React.FC<TeamHeaderProps> = ({
  teamName,
  setTeamName,
  currentPlan,
  membersCount,
  membersLimit,
  onInvite,
  inviteEmail,
  setInviteEmail,
  inviteLoading,
}) => {
  return (
    <div className="flex flex-row w-full gap-8 mt-8 items-stretch">
      {/* Left column */}
      <div className="flex flex-col gap-6 w-full max-w-[400px]">
        {/* Team Name */}
        <div>
          <label className="font-semibold text-gray-700 mb-1 block">
            Team Name
          </label>
          <div className="flex items-center gap-2 bg-[#E9EDFF] border border-[#B6C2FF] rounded px-3 py-2">
            <input
              className="bg-transparent outline-none flex-1 text-sm"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Team name..."
            />
            <Pencil className="w-4 h-4 text-gray-500" />
          </div>
        </div>
        {/* Current Plan */}
        <div>
          <label className="font-semibold text-gray-700 mb-1 block">
            Current Plan
          </label>
          <div className="flex items-center gap-2 bg-[#E9EDFF] border border-[#B6C2FF] rounded px-3 py-2">
            <span className="flex-1 font-semibold text-sm">{currentPlan}</span>
            <button className="bg-[#6AFF97] border border-black px-4 py-1 rounded font-semibold text-sm shadow">
              VIEW
            </button>
          </div>
        </div>
        {/* Members */}
        <div>
          <label className="font-semibold text-gray-700 mb-1 block">
            Members
          </label>
          <div className="flex items-center gap-2 bg-[#E9EDFF] border border-[#B6C2FF] rounded px-3 py-2">
            <span className="font-semibold text-sm">
              {membersCount ?? 0}/{membersLimit}
            </span>
            <div className="flex-1 h-2 bg-white rounded-full border mx-2">
              <div
                className="h-2 bg-[#4D65FF] rounded-full"
                style={{
                  width: `${((membersCount ?? 0) / membersLimit) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Right card */}
      <div className="flex flex-col justify-center bg-white border border-[#B6C2FF] rounded-lg px-8 py-8 min-w-[340px] max-w-[400px] shadow-md ml-auto">
        <label className="font-semibold text-gray-700 mb-3 text-lg">
          Add new member via Email
        </label>
        <input
          type="email"
          className="border border-gray-300 rounded px-3 py-2 mb-4 text-sm"
          placeholder="Enter email address..."
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
        />
        <button
          className="bg-[#6AFF97] border border-black px-4 py-2 rounded font-semibold text-black text-sm shadow"
          onClick={onInvite}
          disabled={inviteLoading}
        >
          {inviteLoading ? "Inviting..." : "INVITE"}
        </button>
      </div>
    </div>
  );
};

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
  const [teamName, setTeamName] = useState("My Team");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

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
    if (!inviteEmail) {
      toast.error("Please enter an email address.");
      return;
    }

    setInviteLoading(true);

    try {
      const res = await inviteTeamMember({
        teamId: activeTeamId,
        adminId: adminId,
        email: inviteEmail,
        role: "Member",
      });

      if (!res.error) {
        toast.success("Invite email sent!");
        refetchClientData();
        setInviteEmail("");
      } else {
        toast.error(res.result || "Failed to invite member");
      }
    } catch (err) {
      toast.error("Failed to invite member");
    } finally {
      setInviteLoading(false);
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

  const handleInvite = () => {
    setInviteLoading(true);
    setTimeout(() => {
      setInviteLoading(false);
      setInviteEmail("");
      toast.success("Invite sent!");
    }, 1000);
  };

  return (
    <section className="h-full overflow-x-hidden">
      {/* upper side title and toggle btn  */}
      <div className="upper px-4 md:px-12 pt-12">
        <h2 className="text-2xl font-semibold text-gray-900">Team</h2>
        <p className="text-gray-600">
          Manage your team members, assign roles and invite new collaborators
        </p>

        <TeamHeader
          teamName={teamName}
          setTeamName={setTeamName}
          currentPlan={clientUsage?.usage?.planId || "-"}
          membersCount={clientData?.teamMembers?.length ?? 0}
          membersLimit={25}
          onInvite={handleInviteSubmit}
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
          inviteLoading={inviteLoading}
        />
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
        <div className="bg-[#D4FFD9] p-4 rounded-xl mt-8">
          <h3 className="text-base font-bold mb-2">PENDING INVITES</h3>
          {invites.length === 0 ? (
            <div className="py-4 text-center text-sm text-gray-600">
              No invites found.
            </div>
          ) : (
            invites.map((invite, idx) => (
              <div
                key={invite.email || idx}
                className="flex flex-row items-center justify-between bg-white rounded-lg px-6 py-3 mb-2"
              >
                <div className="text-sm text-gray-800">
                  Invited by{" "}
                  <span className="font-semibold">
                    {invite.email || "<PERSON NAME>"}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {invite.teamName || "<TEAM NAME>"}
                  </span>
                </div>
                <div className="flex gap-3 ml-4">
                  <button
                    className="bg-[#6AFF97] border border-black rounded-full px-5 py-1 text-sm font-medium text-black hover:bg-[#4DFF88] focus:outline-none"
                    onClick={() => handleInviteAction(invite, "accepted")}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-[#FFBDBD] border border-black rounded-full px-5 py-1 text-sm font-medium text-black hover:bg-[#FF9797] focus:outline-none"
                    onClick={() => handleInviteAction(invite, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Team;
