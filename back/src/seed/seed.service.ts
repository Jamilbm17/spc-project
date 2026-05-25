import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Topic } from '../topics/entities/topic.entity';
import { Institution, InstitutionTypeEnum } from '../institutions/entities/institution.entity';
import { Activity, ActivityStatusEnum } from '../activities/entities/activity.entity';
import { Student } from '../students/entities/student.entity';

@Injectable()
export class SeedService implements OnModuleInit {
    constructor(
        @InjectRepository(Topic)
        private readonly topicRepo: Repository<Topic>,
        @InjectRepository(Institution)
        private readonly institutionRepo: Repository<Institution>,
        @InjectRepository(Activity)
        private readonly activityRepo: Repository<Activity>,
        @InjectRepository(Student)
        private readonly studentRepo: Repository<Student>,
    ) { }

    async onModuleInit() {
        await this.seedTopics();
        await this.seedInstitutions();
        await this.seedActivities();
        await this.seedStudents();
    }

    // ─── Topics ─────────────────────────────────────────────────────────────────

    private async seedTopics() {
        const exists = await this.topicRepo.findOne({ where: { name: 'Prevención de drogas' } });
        if (exists) return;

        const topics = [
            { name: 'Prevención de drogas', description: 'Información y estrategias para prevenir el consumo de sustancias psicoactivas.' },
            { name: 'Salud mental y bienestar', description: 'Herramientas para cuidar la salud emocional y psicológica.' },
            { name: 'Violencia doméstica', description: 'Detección, prevención y apoyo ante situaciones de violencia intrafamiliar.' },
            { name: 'Educación sexual integral', description: 'Formación en sexualidad, relaciones sanas y salud reproductiva.' },
            { name: 'Alimentación saludable', description: 'Nutrición, hábitos alimentarios y prevención de enfermedades.' },
            { name: 'Actividad física y deporte', description: 'Beneficios del ejercicio y promoción de estilos de vida activos.' },
            { name: 'Bullying y acoso escolar', description: 'Estrategias de prevención e intervención ante el acoso en centros educativos.' },
            { name: 'Adicciones digitales', description: 'Uso responsable de tecnología, redes sociales y videojuegos.' },
            { name: 'Primeros auxilios básicos', description: 'Técnicas de emergencia y respuesta inmediata ante accidentes.' },
            { name: 'Seguridad vial', description: 'Normas de tránsito, prevención de accidentes y educación vial.' },
            { name: 'Cuidado del medio ambiente', description: 'Conciencia ecológica, reciclaje y sostenibilidad.' },
            { name: 'Derechos humanos y civismo', description: 'Conocimiento de derechos, deberes ciudadanos y participación cívica.' },
            { name: 'Liderazgo juvenil', description: 'Desarrollo de habilidades de liderazgo y trabajo en equipo en jóvenes.' },
            { name: 'Emprendimiento y finanzas personales', description: 'Educación financiera básica y fomento del emprendimiento.' },
            { name: 'Arte y creatividad', description: 'Expresión artística como herramienta de desarrollo personal y comunitario.' },
        ];

        await this.topicRepo.save(topics);
        console.log(`[Seed] ${topics.length} temas creados.`);
    }

    // ─── Institutions ────────────────────────────────────────────────────────────

    private async seedInstitutions() {
        const exists = await this.institutionRepo.findOne({ where: { name: 'Instituto Salesiano' } });
        if (exists) return;

        const institutions = [
            { name: 'Instituto Nacional "José Cecilio del Valle"', type: InstitutionTypeEnum.SCHOOL, city: 'Tegucigalpa', active: true },
            { name: 'Centro Educativo "Renato Rossi"', type: InstitutionTypeEnum.SCHOOL, city: 'San Pedro Sula', active: true },
            { name: 'Instituto Técnico Honduras', type: InstitutionTypeEnum.SCHOOL, city: 'Tegucigalpa', active: true },
            { name: 'Escuela República de México', type: InstitutionTypeEnum.SCHOOL, city: 'Comayagüela', active: true },
            { name: 'Colegio Bilingüe El Prado', type: InstitutionTypeEnum.SCHOOL, city: 'Tegucigalpa', active: true },
            { name: 'Instituto Central "Vicente Cáceres"', type: InstitutionTypeEnum.SCHOOL, city: 'Tegucigalpa', active: true },
            { name: 'Escuela Normal Mixta "Pedro Nufio"', type: InstitutionTypeEnum.SCHOOL, city: 'Tegucigalpa', active: true },
            { name: 'Instituto San Francisco', type: InstitutionTypeEnum.SCHOOL, city: 'La Ceiba', active: true },
            { name: 'Colegio Internacional de Honduras', type: InstitutionTypeEnum.SCHOOL, city: 'Tegucigalpa', active: true },
            { name: 'Instituto Salesiano', type: InstitutionTypeEnum.SCHOOL, city: 'Tegucigalpa', active: true },
        ];

        await this.institutionRepo.save(institutions);
        console.log(`[Seed] ${institutions.length} instituciones creadas.`);
    }

    // ─── Activities ──────────────────────────────────────────────────────────────

    private async seedActivities() {
        const exists = await this.activityRepo.findOne({ where: { title: 'Taller de Prevención de Drogas' } });
        if (exists) return;

        const institutions = await this.institutionRepo.find();
        const topics = await this.topicRepo.find();

        const findInst = (name: string) => institutions.find(i => i.name.includes(name))?.id;
        const findTopic = (name: string) => topics.find(t => t.name.includes(name))?.id;

        const activities = [
            {
                title: 'Taller de Prevención de Drogas',
                description: 'Actividad interactiva con dinámicas grupales sobre los riesgos del consumo de sustancias psicoactivas en jóvenes.',
                date: '2026-05-28',
                startTime: '09:00',
                endTime: '11:30',
                location: 'Salón de actos principal',
                status: ActivityStatusEnum.SCHEDULED,
                expectedParticipants: 60,
                institutionId: findInst('José Cecilio'),
                topicId: findTopic('drogas'),
            },
            {
                title: 'Charla sobre Salud Mental y Bienestar',
                description: 'Espacio de reflexión y orientación psicológica dirigido a estudiantes de secundaria.',
                date: '2026-06-01',
                startTime: '14:00',
                endTime: '16:00',
                location: 'Aula magna',
                status: ActivityStatusEnum.SCHEDULED,
                expectedParticipants: 45,
                institutionId: findInst('Vicente Cáceres'),
                topicId: findTopic('Salud mental'),
            },
            {
                title: 'Educación Sexual Integral',
                description: 'Taller sobre sexualidad responsable, consentimiento y salud reproductiva para jóvenes.',
                date: '2026-06-04',
                startTime: '10:00',
                endTime: '12:00',
                location: 'Sala de conferencias B',
                status: ActivityStatusEnum.SCHEDULED,
                expectedParticipants: 50,
                institutionId: findInst('Bilingüe'),
                topicId: findTopic('sexual'),
            },
            {
                title: 'Curso de Primeros Auxilios Básicos',
                description: 'Capacitación práctica en técnicas de emergencia: RCP, manejo de heridas y actuación ante accidentes.',
                date: '2026-06-08',
                startTime: '08:30',
                endTime: '12:30',
                location: 'Patio cubierto',
                status: ActivityStatusEnum.SCHEDULED,
                expectedParticipants: 40,
                institutionId: findInst('Renato Rossi'),
                topicId: findTopic('auxilio'),
            },
            {
                title: 'Prevención del Bullying Escolar',
                description: 'Charla con dinámicas sobre detección e intervención ante el acoso escolar.',
                date: '2026-06-11',
                startTime: '13:00',
                endTime: '15:00',
                location: 'Auditorio escolar',
                status: ActivityStatusEnum.SCHEDULED,
                expectedParticipants: 70,
                institutionId: findInst('México'),
                topicId: findTopic('Bullying'),
            },
            {
                title: 'Adicciones Digitales y Redes Sociales',
                description: 'Conversatorio sobre uso responsable de tecnología, gaming y redes sociales.',
                date: '2026-06-15',
                startTime: '15:00',
                endTime: '17:00',
                location: 'Laboratorio de informática',
                status: ActivityStatusEnum.SCHEDULED,
                expectedParticipants: 35,
                institutionId: findInst('Salesiano'),
                topicId: findTopic('digital'),
            },
            {
                title: 'Seguridad Vial para Jóvenes',
                description: 'Educación vial práctica: normas de tránsito, uso del casco y prevención de accidentes.',
                date: '2026-06-18',
                startTime: '09:00',
                endTime: '11:00',
                location: 'Cancha deportiva',
                status: ActivityStatusEnum.SCHEDULED,
                expectedParticipants: 80,
                institutionId: findInst('Técnico'),
                topicId: findTopic('vial'),
            },
            {
                title: 'Alimentación Saludable y Nutrición',
                description: 'Taller sobre hábitos alimentarios, lectura de etiquetas y preparación de snacks saludables.',
                date: '2026-06-22',
                startTime: '10:00',
                endTime: '12:00',
                location: 'Comedor escolar',
                status: ActivityStatusEnum.SCHEDULED,
                expectedParticipants: 55,
                institutionId: findInst('Nufio'),
                topicId: findTopic('Alimentación'),
            },
            {
                title: 'Foro de Liderazgo Juvenil',
                description: 'Encuentro de jóvenes líderes comunitarios: trabajo en equipo, comunicación y resolución de conflictos.',
                date: '2026-06-25',
                startTime: '08:00',
                endTime: '13:00',
                location: 'Sala de reuniones',
                status: ActivityStatusEnum.SCHEDULED,
                expectedParticipants: 30,
                institutionId: findInst('Internacional'),
                topicId: findTopic('Liderazgo'),
            },
            {
                title: 'Jornada de Cuidado del Medio Ambiente',
                description: 'Actividad de reforestación y limpieza comunitaria con charla sobre sostenibilidad.',
                date: '2026-06-30',
                startTime: '07:30',
                endTime: '11:30',
                location: 'Parque central del barrio',
                status: ActivityStatusEnum.SCHEDULED,
                expectedParticipants: 90,
                institutionId: findInst('San Francisco'),
                topicId: findTopic('ambiente'),
            },
        ];

        await this.activityRepo.save(activities);
        console.log(`[Seed] ${activities.length} actividades creadas.`);
    }

    // ─── Students ────────────────────────────────────────────────────────────────

    private async seedStudents() {
        const exists = await this.studentRepo.findOne({ where: { email: 'carlos.mendoza@demo.com' } });
        if (exists) return;

        const password = await bcrypt.hash('Student123!', 10);

        const students = [
            // With full data (DNI + phone + grade)
            { firstName: 'Carlos', lastName: 'Mendoza Reyes', email: 'carlos.mendoza@demo.com', password, dni: '0801-1998-12345', institutionName: 'Instituto Nacional "José Cecilio del Valle"', phone: '9901-2345', grade: '3er año', isActive: true },
            { firstName: 'Sofía', lastName: 'López Ramírez', email: 'sofia.lopez@demo.com', password, dni: '0801-2000-23456', institutionName: 'Instituto Central "Vicente Cáceres"', phone: '9902-3456', grade: '2do año', isActive: true },
            { firstName: 'Miguel', lastName: 'Hernández Cruz', email: 'miguel.hernandez@demo.com', password, dni: '0801-1999-34567', institutionName: 'Colegio Bilingüe El Prado', phone: '9903-4567', grade: '1er año', isActive: true },
            { firstName: 'Valentina', lastName: 'García Flores', email: 'valentina.garcia@demo.com', password, dni: '0801-2001-45678', institutionName: 'Instituto Salesiano', phone: '9904-5678', grade: '3er año', isActive: true },
            { firstName: 'Diego', lastName: 'Martínez Soto', email: 'diego.martinez@demo.com', password, dni: '0801-1997-56789', institutionName: 'Instituto Técnico Honduras', phone: '9905-6789', grade: 'Bachillerato', isActive: true },
            { firstName: 'Camila', lastName: 'Rodríguez Pineda', email: 'camila.rodriguez@demo.com', password, dni: '0801-2002-67890', institutionName: 'Escuela República de México', phone: '9906-7890', grade: '2do año', isActive: true },
            { firstName: 'Andrés', lastName: 'Torres Aguilar', email: 'andres.torres@demo.com', password, dni: '0801-1998-78901', institutionName: 'Colegio Internacional de Honduras', phone: '9907-8901', grade: '3er año', isActive: true },
            { firstName: 'Isabella', lastName: 'Morales Vega', email: 'isabella.morales@demo.com', password, dni: '0801-2000-89012', institutionName: 'Centro Educativo "Renato Rossi"', phone: '9908-9012', grade: '1er año', isActive: true },
            // Without phone
            { firstName: 'Sebastián', lastName: 'Jiménez Castro', email: 'sebastian.jimenez@demo.com', password, dni: '0801-1999-90123', institutionName: 'Instituto San Francisco', phone: null, grade: '2do año', isActive: true },
            { firstName: 'Lucía', lastName: 'Vargas Núñez', email: 'lucia.vargas@demo.com', password, dni: '0801-2001-01234', institutionName: 'Escuela Normal Mixta "Pedro Nufio"', phone: null, grade: 'Bachillerato', isActive: true },
            { firstName: 'Mateo', lastName: 'Fuentes Paz', email: 'mateo.fuentes@demo.com', password, dni: '0801-1998-13579', institutionName: 'Instituto Nacional "José Cecilio del Valle"', phone: null, grade: '3er año', isActive: true },
            { firstName: 'Daniela', lastName: 'Castillo Ramos', email: 'daniela.castillo@demo.com', password, dni: '0801-2002-24680', institutionName: 'Instituto Central "Vicente Cáceres"', phone: null, grade: '1er año', isActive: true },
            // Without DNI
            { firstName: 'Alejandro', lastName: 'Reyes Medina', email: 'alejandro.reyes@demo.com', password, dni: null, institutionName: 'Colegio Bilingüe El Prado', phone: '9913-2468', grade: '2do año', isActive: true },
            { firstName: 'Natalia', lastName: 'Ponce Serrano', email: 'natalia.ponce@demo.com', password, dni: null, institutionName: 'Instituto Salesiano', phone: '9914-3579', grade: '3er año', isActive: true },
            { firstName: 'Emilio', lastName: 'Ríos Alvarado', email: 'emilio.rios@demo.com', password, dni: null, institutionName: 'Instituto Técnico Honduras', phone: '9915-4680', grade: 'Bachillerato', isActive: true },
            { firstName: 'Renata', lastName: 'Blanco Herrera', email: 'renata.blanco@demo.com', password, dni: null, institutionName: 'Escuela República de México', phone: '9916-5791', grade: '1er año', isActive: true },
            // Without grade
            { firstName: 'Tomás', lastName: 'Espinoza Duarte', email: 'tomas.espinoza@demo.com', password, dni: '0801-1999-35791', institutionName: 'Colegio Internacional de Honduras', phone: '9917-6802', grade: null, isActive: true },
            { firstName: 'Gabriela', lastName: 'Lara Soriano', email: 'gabriela.lara@demo.com', password, dni: '0801-2000-46802', institutionName: 'Centro Educativo "Renato Rossi"', phone: '9918-7913', grade: null, isActive: true },
            { firstName: 'Ricardo', lastName: 'Solís Padilla', email: 'ricardo.solis@demo.com', password, dni: '0801-1997-57913', institutionName: 'Instituto San Francisco', phone: '9919-8024', grade: null, isActive: true },
            { firstName: 'Paola', lastName: 'Miranda Ávila', email: 'paola.miranda@demo.com', password, dni: '0801-2001-68024', institutionName: 'Escuela Normal Mixta "Pedro Nufio"', phone: null, grade: null, isActive: true },
            // Minimal data (only required fields)
            { firstName: 'Jorge', lastName: 'Salinas Ortiz', email: 'jorge.salinas@demo.com', password, dni: null, institutionName: 'Instituto Nacional "José Cecilio del Valle"', phone: null, grade: null, isActive: true },
            { firstName: 'Verónica', lastName: 'Campos Ibarra', email: 'veronica.campos@demo.com', password, dni: null, institutionName: 'Instituto Central "Vicente Cáceres"', phone: null, grade: null, isActive: true },
            { firstName: 'Fernando', lastName: 'Guzmán Trejo', email: 'fernando.guzman@demo.com', password, dni: '0801-1998-79135', institutionName: 'Colegio Bilingüe El Prado', phone: null, grade: null, isActive: true },
            { firstName: 'Ana', lastName: 'Delgado Vásquez', email: 'ana.delgado@demo.com', password, dni: null, institutionName: 'Instituto Salesiano', phone: '9923-0246', grade: null, isActive: true },
            // Inactive student
            { firstName: 'Roberto', lastName: 'Peña Montes', email: 'roberto.pena@demo.com', password, dni: '0801-1996-80246', institutionName: 'Instituto Técnico Honduras', phone: '9924-1357', grade: '3er año', isActive: false },
            // More variety
            { firstName: 'Claudia', lastName: 'Mejía Quintero', email: 'claudia.mejia@demo.com', password, dni: '0801-2002-91357', institutionName: 'Escuela República de México', phone: '9925-2468', grade: '2do año', isActive: true },
            { firstName: 'Marco', lastName: 'Pacheco Leiva', email: 'marco.pacheco@demo.com', password, dni: null, institutionName: 'Colegio Internacional de Honduras', phone: '9926-3579', grade: '1er año', isActive: true },
            { firstName: 'Valeria', lastName: 'Nieto Coronel', email: 'valeria.nieto@demo.com', password, dni: '0801-1999-02468', institutionName: 'Centro Educativo "Renato Rossi"', phone: null, grade: 'Bachillerato', isActive: true },
            { firstName: 'Javier', lastName: 'Sandoval Ibáñez', email: 'javier.sandoval@demo.com', password, dni: '0801-2000-13579', institutionName: 'Instituto San Francisco', phone: '9928-5791', grade: '2do año', isActive: true },
            { firstName: 'Mónica', lastName: 'Fuentes Gallardo', email: 'monica.fuentes@demo.com', password, dni: null, institutionName: 'Escuela Normal Mixta "Pedro Nufio"', phone: null, grade: '3er año', isActive: true },
        ];

        await this.studentRepo.save(students);
        console.log(`[Seed] ${students.length} estudiantes de prueba creados.`);
    }
}
