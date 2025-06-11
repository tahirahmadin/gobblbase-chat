import React, { useEffect, useState } from "react";
import { getClient, getClientUsage } from "../../../../lib/serverActions";
import { useAdminStore } from "../../../../store/useAdminStore";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Copy, Plus, X } from "lucide-react";
interface ClientUsageData {
    creditsInfo: {
        totalCredits: number;
        availableCredits: number;
    };
    usage: {
        agentUsage: {
            totalTokensUsed: number;
            usageData: {
                _id: string;
                clientId: string;
                agentId: string;
                date: string;
                totalTokensUsed: number;
            }[];
            agentId: string;
            agentName: string;
        }[];
        totalTokensUsedAllAgents: number;
        planId: string;
        agentLimit: number;
    };
    totalAgentCount: number;
}
const membersRole = [
    {
        _id: "1",
        title: "John Doe",
        email: "john.doe@example.com",
        role: [
            {
                label: "Super Admin",
                value: "Can Do Everything",
            },
            {
                label: "Admin",
                value: "Everything Except Team Management",
            },
            {
                label: "Member",
                value: "Everything Except Team Management & Billing",
            },
        ],
        images: ["https://randomuser.me/api/portraits/men/1.jpg"],
    },
    {
        _id: "2",
        title: "Jane Smith",
        email: "jane.smith@example.com",
        role: [
            {
                label: "Super Admin",
                value: "Can Do Everything",
            },
            {
                label: "Admin",
                value: "Everything Except Team Management",
            },
            {
                label: "Member",
                value: "Everything Except Team Management & Billing",
            },
        ],
        images: ["https://randomuser.me/api/portraits/women/2.jpg"],
    },
    {
        _id: "3",
        title: "Alex Johnson",
        email: "alex.johnson@example.com",
        role: [
            {
                label: "Super Admin",
                value: "Can Do Everything",
            },
            {
                label: "Admin",
                value: "Everything Except Team Management",
            },
            {
                label: "Member",
                value: "Everything Except Team Management & Billing",
            },
        ],
        images: ["https://randomuser.me/api/portraits/women/2.jpg"],
    },
    {
        _id: "4",
        title: "Emily Davis",
        email: "emily.davis@example.com",
        role: [
            {
                label: "Super Admin",
                value: "Can Do Everything",
            },
            {
                label: "Admin",
                value: "Everything Except Team Management",
            },
            {
                label: "Member",
                value: "Everything Except Team Management & Billing",
            },
        ],
        images: ["https://randomuser.me/api/portraits/women/3.jpg"],
    },
    {
        _id: "5",
        title: "Michael Brown",
        email: "michael.brown@example.com",
        role: [
            {
                label: "Super Admin",
                value: "Can Do Everything",
            },
            {
                label: "Admin",
                value: "Everything Except Team Management",
            },
            {
                label: "Member",
                value: "Everything Except Team Management & Billing",
            },
        ],
        images: ["https://randomuser.me/api/portraits/men/4.jpg"],
    },
];
// Available roles (you can extract this from your membersRole data)
const availableRoles = [
    {
        label: "Super Admin",
        value: "Can Do Everything",
    },
    {
        label: "Admin",
        value: "Everything Except Team Management",
    },
    {
        label: "Member",
        value: "Everything Except Team Management & Billing",
    },
];
const Team = () => {
    // IMPORTS & HOOKS
    const { adminId } = useAdminStore();
    const navigate = useNavigate();

    // NAVIGATION FUNCTIONS
    const navigateToPlans = () => {
        navigate("/admin/account/plans");
    };
    // PLAN & USAGE DATA STATE MANAGEMENT
    const [currentPlan, setCurrentPlan] = useState("");
    const [usageData, setUsageData] = useState<ClientUsageData | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch usage data and client plan information
    useState(() => {
        const fetchUsageData = async () => {
            if (!adminId) return;

            try {
                setLoading(true);
                const [usageData, clientData] = await Promise.all([
                    getClientUsage(adminId),
                    getClient(adminId),
                ]);

                if (usageData) {
                    setUsageData(usageData);
                }

                if (clientData) {
                    setCurrentPlan(clientData.planId);
                } else {
                    console.error("Client data not found");
                }
            } catch (error) {
                console.error("Error fetching client data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsageData();
    }, [adminId]);

    // EXISTING MEMBERS STATE & FUNCTIONS
    // =====================================
    // Dropdown state for existing members role selection
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // Store role labels for existing members (initialized from membersRole data)
    const [selectedRoles, setSelectedRoles] = useState(
        membersRole.reduce((acc: Record<string, string>, member) => {
            acc[member._id] = member.role[0].label; // Store label instead of value
            return acc;
        }, {})
    );

    // Handle role change for existing members
    const handleRoleChange = (memberId: string, newRoleLabel: string) => {
        setSelectedRoles((prev) => ({
            ...prev,
            [memberId]: newRoleLabel,
        }));
        setOpenDropdown(null);
    };

    // NEW MEMBERS STATE & FUNCTIONS
    // =====================================
    // State for managing multiple new member additions
    const [newMembers, setNewMembers] = useState<
        Array<{
            id: string;
            role: string;
            dropdownOpen: boolean;
        }>
    >([]);

    // Add a new member input section
    const handleAddNewMember = () => {
        const newMember = {
            id: `new-member-${Date.now()}`, // Unique ID using timestamp
            role: "Super Admin", // Default role
            dropdownOpen: false,
        };
        setNewMembers((prev) => [...prev, newMember]);
    };

    // Handle role change for a specific new member
    const handleNewMemberRoleChange = (
        memberId: string,
        newRoleLabel: string
    ) => {
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

    // Remove a new member input section
    const handleRemoveNewMember = (memberId: string) => {
        setNewMembers((prev) => prev.filter((member) => member.id !== memberId));
    };
    // Handle delete modal opening (placeholder for delete logic)
    const openDeleteModal = (memberId: string) => {
        // TODO: Implement delete logic here
    };
    return (
        <section className="h-full overflow-x-hidden">
            {/* upper side title and toggle btn  */}
            <div className="upper px-4 md:px-12 pt-12">
                <h2 className="text-2xl font-semibold text-gray-900 text-center md:text-left">Team</h2>
                <p className="text-black text-[14px] text-center md:text-left">
                    Manage your team members, assign roles and invite new collaborators
                </p>
                <div className="flex flex-wrap gap-4 mb-6 w-full mt-8">
                    {/* Current Plan */}
                    <div className="bg-[#CEFFDC] rounded-lg p-4 justify-between min-w-[150px] w-full max-w-[400px]">
                        <span className="text-[0.9rem] text-gray-600">Current Plan</span>
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-[1.2rem]">{currentPlan}</span>
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
                    <div className="bg-[#D4DEFF] rounded-lg p-4 flex flex-col xs:flex-row items-end gap-4 flex justify-between min-w-[120px] w-full max-w-[450px]">
                        <div className="team-member-bar w-full">
                            <div className="flex items-center mb-2 whitespace-nowrap">
                                <span className="text-2xl font-bold mr-2">2</span>
                                <span className="text-gray-700">
                                    /10 <span>Team Members</span>
                                </span>
                            </div>
                            <div className="w-full h-3 bg-white rounded-full shadow-[inset_0_3px_3px_0_rgba(0,0,0,0.25)]">
                                <div
                                    className="h-3 bg-[#4D65FF] border border-black rounded-full"
                                    style={{
                                        width: `${10 > 0 ? 20 : 0}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <div className="absolute top-[4px] left-[4px] -z-10 bg-[#6AFF97] border border-black w-full h-full"></div>
                            <button
                                onClick={() => {
                                    console.log("View Team Members");
                                }}
                                className="whitespace-nowrap flex items-center gap-2 bg-[#6AFF97] border border-black text-black font-semibold px-4 py-1"
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

            {/* Team manage table  */}
            <div className="middle px-4 md:px-12 pt-6 scrollbar-custom">
                <div className="bg-[#EEEEEE] border border-gray-200 p-6 rounded-lg">
                    <div className=" h-[100%] overflow-y-auto  w-[100px] min-w-[100%] overflow-x-auto">
                        {/* products manage in desktop table for large file  */}
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
                                    ) : membersRole.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4 text-sm">
                                                No products found.
                                            </td>
                                        </tr>
                                    ) : (
                                        membersRole.map((member) => (
                                            <tr key={member._id} className="border-t text-center">
                                                <td className="py-1.5 px-12 text-sm text-left rounded-l-[12px]">
                                                    <div className="flex items-center gap-1.5 justify-start ">
                                                        <img
                                                            src={
                                                                member.images[0] ||
                                                                "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ="
                                                            }
                                                            alt=""
                                                            className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover"
                                                        />
                                                        <div className="uppercase text-[0.9rem]">
                                                            {member.title}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-1.5 px-2 text-sm text-center">
                                                    {member.email}
                                                </td>

                                                <td className="mx-auto py-2 relative w-30 xs:w-48 flex items-center">
                                                    <div
                                                        className="relative w-full px-3 py-2 border border-[#7D7D7D] text-sm focus:outline-none rounded-sm flex justify-between items-center bg-white cursor-pointer"
                                                        onClick={() =>
                                                            setOpenDropdown(
                                                                openDropdown === member._id ? null : member._id
                                                            )
                                                        }
                                                    >
                                                        {selectedRoles[member._id]}
                                                    </div>
                                                    <div className="icon bg-[#AEB8FF] px-2 py-2 border border-[#7D7D7D] border-l-0 rounded-r-sm">
                                                        <ChevronDown
                                                            size={20}
                                                            className={`text-[#000000] stroke-[3px] transition-transform ${openDropdown === member._id ? "rotate-180" : ""
                                                                }`}
                                                        />
                                                    </div>
                                                    {openDropdown === member._id && (
                                                        <div className="absolute z-10 mt-1 top-12 w-full bg-white border border-[#7D7D7D] shadow-lg rounded-sm">
                                                            {member.role.map((roleOption) => (
                                                                <div
                                                                    key={roleOption.value}
                                                                    onClick={() =>
                                                                        handleRoleChange(
                                                                            member._id,
                                                                            roleOption.label
                                                                        )
                                                                    }
                                                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-100 transition-colors flex flex-col cursor-pointer ${selectedRoles[member._id] ===
                                                                            roleOption.label
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
                                                </td>

                                                <td className="py-1.5 px-2 rounded-r-[12px] ">
                                                    <div className="flex gap-1.5 items-center justify-center">
                                                        <button
                                                            className="bg-[#FF9797] text-[#000] w-24 py-2 rounded-full border border-[#000] text-sm"
                                                            onClick={() => openDeleteModal(member._id)}
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


                        {/* products manage in desktop table for large file  */}
                        <div className="block md:hidden">
                            <table className="w-full min-w-[100px] border-separate border-spacing-y-2">
                                <thead className="sticky top-0 bg-[#CEFFDC] ">
                                    <tr className="z-[50] relative">
                                        <th className="py-1.5 px-2 text-left text-sm rounded-l-[12px] text-center z-40 relative">
                                            TEAM MEMBER
                                        </th>
                                        
                                        <th className="py-1.5 px-2 text-left text-sm rounded-r-[12px] text-center">
                                            ASSIGNED ROLE
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white z-10">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4 text-sm">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : membersRole.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4 text-sm">
                                                No products found.
                                            </td>
                                        </tr>
                                    ) : (
                                        membersRole.map((member) => (
                                            <tr key={member._id} className="border-t text-center">
                                                <td className="py-1.5 px-12 text-sm text-left rounded-l-[12px]">
                                                    
                                                    <div className="flex items-center gap-1.5 justify-start ">
                                                        <img
                                                            src={
                                                                member.images[0] ||
                                                                "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ="
                                                            }
                                                            alt=""
                                                            className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="uppercase text-[0.9rem] font-semibold">
                                                                {member.title}
                                                            </span>
                                                            <span className="text-[0.8rem] text-gray-500">
                                                                {member.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-2 relative rounded-r-[12px] px-12 flex items-center gap-4">
                                                    <div className="w-30 xs:w-48 flex items-center">
                                                        <div
                                                            className="whitespace-nowrap relative w-full px-3 py-2 border border-[#7D7D7D] text-sm focus:outline-none flex justify-between items-center bg-white cursor-pointer"
                                                            onClick={() =>
                                                                setOpenDropdown(
                                                                    openDropdown === member._id ? null : member._id
                                                                )
                                                            }
                                                        >
                                                            {selectedRoles[member._id]}
                                                        </div>
                                                        <div className="icon bg-[#AEB8FF] px-2 py-2 border border-[#7D7D7D] border-l-0">
                                                            <ChevronDown
                                                                size={20}
                                                                className={`text-[#000000] stroke-[3px] transition-transform ${openDropdown === member._id ? "rotate-180" : ""
                                                                    }`}
                                                            />
                                                        </div>
                                                        {openDropdown === member._id && (
                                                            <div className="absolute z-10 mt-1 top-12 w-full bg-white border border-[#7D7D7D] shadow-lg rounded-sm">
                                                                {member.role.map((roleOption) => (
                                                                    <div
                                                                        key={roleOption.value}
                                                                        onClick={() =>
                                                                            handleRoleChange(
                                                                                member._id,
                                                                                roleOption.label
                                                                            )
                                                                        }
                                                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-100 transition-colors flex flex-col cursor-pointer ${selectedRoles[member._id] ===
                                                                                roleOption.label
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
                                                        <div className="flex relative gap-1.5 items-center justify-center z-10">
                                                            <div className="absolute top-[2px] left-[2px] w-full h-full bg-[#FF9797] border border-[#000] -z-10"></div>
                                                            <button
                                                                className="bg-[#FF9797] text-[#000] p-2 border border-[#000] text-sm"
                                                                onClick={() => openDeleteModal(member._id)}
                                                            >
                                                                <X className="h-4 w-4" style={{strokeWidth: "4px"}} />
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
            </div>

            {/* New Member Section */}
            <div className="below px-4 md:px-12 pt-6 pb-12">
                <button
                    className="new-member flex items-center gap-2"
                    onClick={handleAddNewMember}
                >
                    <Plus className="h-4 w-4" />
                    <span className="main-font text-[1.2rem]">New Member</span>
                </button>

                {newMembers.map((member, index) => (
                    <div key={member.id} className="new-member-section">
                        {/* New Member Role Selection */}
                        <div className="new-member-role z-20 mt-4 mb-6 flex flex-col xs:flex-row items-center gap-4 w-full sm:w-1/2 border border-[#000] p-4 rounded-lg relative">
                            {/* Remove button */}
                            <button
                                onClick={() => handleRemoveNewMember(member.id)}
                                className="absolute top-2 z-10 right-2 text-red-500 hover:text-red-700 transition-colors"
                                title="Remove this member"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <h3 className="whitespace-nowrap main-font text-[1.1rem] font-semibold text-gray-800">
                                Assign Role
                            </h3>
                            <div className="relative w-full sm:w-64 flex items-center">
                                <div
                                    className="whitespace-nowrap relative w-full px-3 py-2 border border-[#7D7D7D] text-sm focus:outline-none rounded-sm flex justify-between items-center bg-white cursor-pointer"
                                    onClick={() => toggleNewMemberDropdown(member.id)}
                                >
                                    {member.role}
                                </div>
                                <div className="icon bg-[#AEB8FF] px-2 py-2 border border-[#7D7D7D] border-l-0 rounded-r-sm">
                                    <ChevronDown
                                        size={20}
                                        className={`text-[#000000] stroke-[3px] transition-transform ${member.dropdownOpen ? "rotate-180" : ""
                                            }`}
                                    />
                                </div>

                                {member.dropdownOpen && (
                                    <div className="absolute z-10 mt-1 top-12 w-full bg-white border border-[#7D7D7D] shadow-lg rounded-sm">
                                        {availableRoles.map((roleOption) => (
                                            <div
                                                key={roleOption.value}
                                                onClick={() =>
                                                    handleNewMemberRoleChange(member.id, roleOption.label)
                                                }
                                                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-100 transition-colors flex flex-col cursor-pointer ${member.role === roleOption.label ? "bg-[#AEB8FF]" : ""
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
                        <div className="new-member-invite mt-4 mb-6 flex flex-col items-center gap-4 w-full md:w-1/2 border border-[#000] py-10 px-6 rounded-lg">
                            <div className="view-link flex flex-col gap-2 w-full">
                                <h3 className="text-[1.2rem] font-semibold text-gray-800">
                                    Invite people via link
                                </h3>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-[#7D7D7D] text-sm focus:outline-none rounded-sm bg-white"
                                    value={`https://www.sayy.ai/invite?role=${member.role}`}
                                    readOnly
                                />
                                <div className="relative mt-4 z-10 w-fit flex justify-center mx-auto">
                                    <div className="absolute top-[4px] left-[4px] -z-10 bg-[#6AFF97] w-full h-full border border-black"></div>
                                    <button
                                        className="bg-[#6AFF97] min-w-[100px] flex items-center gap-2 relative z-10 text-black px-4 py-2 border border-black"
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                `https://www.sayy.ai/invite?role=${member.role}`
                                            );
                                            alert("Invite link copied to clipboard!");
                                        }}
                                    >
                                        <Copy className="h-5 w-5 text-black" />
                                        Copy
                                    </button>
                                </div>
                            </div>
                            <span className="text-black text-lg mb-6">or</span>
                            <div className="view-email flex flex-col gap-2 w-full">
                                <h3 className="text-[1.2rem] font-semibold text-gray-800">
                                    Invite people via email
                                </h3>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-[#7D7D7D] text-sm focus:outline-none rounded-sm bg-white"
                                    placeholder="Enter email address"
                                />
                                <div className="relative mt-4 z-10 w-fit flex justify-center mx-auto">
                                    <div className="absolute top-[4px] left-[4px] -z-10 bg-[#6AFF97] w-full h-full border border-black"></div>
                                    <button
                                        className="bg-[#6AFF97] min-w-[100px] relative z-10 text-black px-4 py-2 border border-black"
                                        onClick={() => {
                                            alert("Invite email sent!");
                                        }}
                                    >
                                        Invite
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Team;
