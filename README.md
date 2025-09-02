# Signalen Frontend Employee

De **Signalen Frontend Employee** applicatie is een open-source project ontwikkeld door studenten van de opleiding **OPEN-ICT** aan de Hogeschool Utrecht.  
Het doel van dit project is het ontwerpen en bouwen van een nieuwe, intuïtieve gebruikersinterface voor het [Signalen-platform](https://signalen.org), een meldingsplatform dat door veel Nederlandse gemeenten wordt gebruikt voor het afhandelen van meldingen in de openbare ruimte (bijvoorbeeld zwerfafval, kapotte lantaarnpalen of verkeersoverlast).

## Voor studenten
Als student werk je in dit project aan een moderne **frontend-applicatie** die aansluit op de bestaande Signalen REST API.  
Je krijgt de kans om te werken met technologieën als **React/Next.js, TypeScript, CSS/Tailwind** en kun bovendien experimenteren met **AI en UX-design**.

### Introductie tot het project
Allereerst, welkom bij Delta10. Bij Delta10 ontwikkelen en onderhouden wij software voor gemeenten. Komende tijd maak jij deel uit van ons team en ga je bouwen aan een vriendelijke beheerinterface van Signalen (ook wel de back-office genoemd). 

Voordat je aan de slag gaat met het project raden we je aan om eerst even via [docs/projectbeschrijving.md](/docs/projectomschrijving.md) of https://github.com/delta10/signalen-frontend-employee/blob/main/docs/projectomschrijving.md de projectbeschrijving een keer goed door te nemen. Deze projectbeschrijving geeft je een hoop waardevolle informatie voor de komende periode.

### Werken aan het project
Tijdens het bouwen aan de Signalen Frontend Employee app krijg je van ons veel vrijheid. Wel hebben we alvast een aantal dingen besloten. Daarover valt hieronder meer te lezen.

#### Werken met GitHub (projectmanagement)
Voor dit project gebruiken we [GitHub](https://github.com/delta10/signalen-frontend-employee) als centrale plek voor alle code en projectinformatie.  
Bij dit project hoort een [issuelijst](https://github.com/delta10/signalen-frontend-employee/issues). Hier voegen wij (en jij zelf ook) nieuwe issues aan toe.

Daarnaast is er een [GitHub Project](https://github.com/orgs/delta10/projects/16) gekoppeld. Dit werkt met een kanban-bord, zodat je eenvoudig kunt zien welke issues in welke fase zitten (to do, in progress, done).

Tijdens het project verwachten we dat je:
- **Issues gebruikt** om werk te plannen en status te updaten.
- **Jouw naam koppelt aan een issue** zodra je eraan gaat werken, zodat het voor iedereen duidelijk is wie waar mee bezig is.
- **Pull Requests koppelt aan issues** zodat de voortgang transparant is. Wanneer een Pull Request gemerged wordt, sluit het gekoppelde issue automatisch.
- **Milestones gebruikt per sprint**. Zo houden we samen overzicht over welke issues wel/niet zijn afgerond binnen een sprint.

#### Werken met GitHub (code)
We werken met een **branching workflow**. Dit betekent dat je niet direct in de `main`-branch werkt, maar altijd vanuit een aparte branch.

De werkwijze is als volgt:
1. **Maak een nieuwe branch** gebaseerd op `main` zodra je aan een issue begint.
    - Gebruik bij voorkeur een duidelijke naam, bijvoorbeeld:  
      `feature/filter-component` of `bugfix/map-loading`.
2. **Commit en push** je wijzigingen in deze branch.
3. Als je werk klaar is, **maak je een Pull Request (PR)** vanaf jouw branch naar `main`.
    - Koppel het PR aan het juiste issue.
4. Je PR wordt vervolgens gereviewd door:
    - Minimaal **één teamgenoot**
    - **Één reviewer van Delta10**
5. Zodra de reviewers akkoord zijn, wordt jouw PR gemerged in `main`.  
   Het gekoppelde issue wordt dan automatisch gesloten. 

Op deze manier blijft de `main`-branch altijd stabiel, en werken we gestructureerd en samen aan de codebase.

#### Werken met de frontend

Bij Delta10 werken we veel met NextJS. Daarom is voor het studentenproject gekozen om ook met NextJS te werken.  
We hebben alvast de basis van het project opgezet met de NextJS app router. Alle relevante frontend-code staat in de map `frontend`. In deze map kan aan de frontend worden gewerkt.

Voor de frontend gebruiken we:
- NextJS
- shadcn: [https://ui.shadcn.com/](https://ui.shadcn.com/)
- TailwindCSS: [https://tailwindcss.com/](https://tailwindcss.com/)
- TypeScript
- ESLint en Prettier

Prettier is een codeformatter. Het zorgt ervoor dat je code er altijd netjes en consistent uitziet, ongeacht wie de code schrijft.  
ESLint is een codechecker. Het controleert of je code fouten of slechte gewoontes bevat.

Afhankelijk van je IDE (VSCode, WebStorm, etc.) moet er mogelijk nog wat worden geconfigureerd om automatisch gebruik te maken van ESLint en Prettier. Het team van Delta10 kan hierbij helpen.

Clone allereerst het GitHub-project op je ontwikkelmachine.

**Frontend Project opstarten**

1. Ga in de terminal naar de frontend-map:
   ```bash
   cd frontend
   ```
2. Installeer de benodigde NPM-packages:
   ```bash
   npm install
   ```
3. Start de frontend
   ```bash
   npm run dev
   ```

De frontend is daarna beschikbaar op: http://localhost:3000. 

#### Werken met de backend

Zorg dat [Docker](http://docker.com/) en Docker compose zijn geïnstalleerd op je machine. Start met het volgende commando het backend project op:

```bash
docker compose up
```

De backend is daarna beschikbaar op: http://localhost:8000/signals/. Het beheerpaneel is te vinden op http://localhost:8000/signals/admin/. Een overzicht van alle uitgaande mail is te vinden op http://localhost:8025/.

#### Demo omgeving
Wij hebben zowel een demo-omgeving voor de backend als voor de frontend beschikbaar gesteld.

**Frontend**:\
Op het moment dat er een Pull Request wordt aangemaakt in GitHub wordt er automatisch door Vercel een instantie opgespind waarop je je gedane frontend werk kan bekijken. De demo omgeving van de main branche is altijd inzichtelijk via: https://studenten-project.vercel.app/.

**Backend**:\
- Frontend: https://meldingen.utrecht.demo.delta10.cloud/
- Backoffice: https://meldingen.utrecht.demo.delta10.cloud/manage
- Mailhog: https://meldingen.utrecht.demo.delta10.cloud/mailhog
- Django admin: https://api.meldingen.utrecht.demo.delta10.cloud/signals/admin/

Voor de inloggegevens van de backend raden wij aan even contact op te nemen met een van ons (Delta10 medewerkers).

# Voor externen
Deze repository bevat de frontend voor de “employee”-kant van het Signalen-platform: de interface waarmee gemeentemedewerkers meldingen kunnen bekijken, filteren en afhandelen.  
Het project is open-source, zodat andere gemeenten, ontwikkelaars of geïnteresseerden kunnen meekijken met de ontwikkeling van deze app.
