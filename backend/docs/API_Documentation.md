
# 📘 Workspace REST API Documentation

Base URL: `http://localhost:8087/workspaces`

---

## ➕ Create Workspace

**POST** `/workspaces`

![Create Workspace](api_images/create_workspace.png)

---

## 📂 Get All Workspaces

**GET** `/workspaces`

![Get All Workspaces](api_images/get_workspaces.png)

---

## 📂 Get Workspace by ID

**GET** `/workspaces/{workspaceId}`

![Get Workspace By ID](api_images/get_workspace_by_id.png)

---

## ✏️ Update Workspace

**PUT** `/workspaces/{workspaceId}`

![Update Workspace](api_images/update_workspace.png)

---

## 🗑️ Delete Workspace

**DELETE** `/workspaces/{workspaceId}`

> ❗ Requires the workspace to be archived first.

![Delete Workspace](api_images/delete_workspace.png)

---

## ➕ Add Member to Workspace

**POST** `/workspaces/{workspaceId}/members`

*Note: Make sure the string is not wrapped in quotes (JSON-style) or it will be stored incorrectly.*

![Add Member to Workspace](api_images/add_member_to_workspace.png)
![Add Member to Workspace](api_images/add_member_to_workspace2.png)


---

## ❌ Remove Member from Workspace

**DELETE** `/workspaces/{workspaceId}/members/{memberId}`


![Remove Member From Workspace](api_images/remove_member_from_workspace.png)
