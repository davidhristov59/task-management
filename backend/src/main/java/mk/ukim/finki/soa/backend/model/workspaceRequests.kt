package mk.ukim.finki.soa.backend.model

data class CreateWorkspaceRequest(
    val title: String,
    val description: String? = null,
    val ownerId: String,
    val memberIds: List<String>? = null
)

data class UpdateWorkspaceRequest(
    val title: String? = null,
    val description: String? = null,
    val memberIds: List<String>? = null,
    val ownerId: String? = null,
    val archived: Boolean? = null
)