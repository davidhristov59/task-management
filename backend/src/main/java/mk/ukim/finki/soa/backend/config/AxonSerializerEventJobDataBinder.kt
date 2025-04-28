package mk.ukim.finki.soa.backend.config

import org.axonframework.eventhandling.scheduling.quartz.EventJobDataBinder
import org.axonframework.serialization.Serializer
import org.axonframework.serialization.SimpleSerializedObject
import org.axonframework.serialization.SimpleSerializedType
import org.quartz.JobDataMap
import org.springframework.stereotype.Component

@Component
class AxonSerializerEventJobDataBinder(private val serializer: Serializer) : EventJobDataBinder {
    override fun toJobData(eventMessage: Any): JobDataMap {
        val serializedEvent = serializer.serialize(eventMessage, String::class.java)
        val jobData = JobDataMap()
        jobData["data"] = serializedEvent.data
        jobData["type.name"] = serializedEvent.type.name
        jobData["type.revision"] = serializedEvent.type.revision
        return jobData
    }

    override fun fromJobData(jobData: JobDataMap): Any {
        val type = SimpleSerializedType(jobData["type.name"] as String?, jobData["type.revision"] as String?)
        val serializedEvent = SimpleSerializedObject(jobData["data"] as String?, String::class.java, type)
        return serializer.deserialize(serializedEvent)
    }
}