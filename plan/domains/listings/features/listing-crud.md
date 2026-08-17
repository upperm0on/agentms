# Listing CRUD

MVP actions:

- Create listing
- Read own listings
- Update listing
- Delete or archive listing
- Publish listing
- Unpublish listing
- Mark available
- Mark unavailable
- Mark full
- Refresh availability timestamp

Required listing data before publishing:

- Agent
- Property or property details
- Location/campus
- Title
- Room type
- Price
- Price period
- Capacity
- Available slots
- Availability status
- Contactable agent profile

Rules:

- Agents can only edit their own listings.
- Published listings must pass data quality rules.
- Deleting a listing should usually archive it instead of hard deleting it.
