package mk.ukim.finki.soa.backend.model

data class CreateProjectRequest(
    val title: String,
    val description: String? = null,
    val ownerId: String
)

data class UpdateProjectRequest(
    val title: String? = null,
    val description: String? = null,
    val status: ProjectStatus? = null,
    val ownerId: String? = null,
    val archived: Boolean? = null
)
