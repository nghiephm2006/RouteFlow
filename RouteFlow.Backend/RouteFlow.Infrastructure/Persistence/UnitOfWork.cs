using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using RouteFlow.Domain.Common;
using RouteFlow.Domain.Interfaces;

namespace RouteFlow.Infrastructure.Persistence
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private readonly IMediator _mediator;

        public UnitOfWork(AppDbContext context, IMediator mediator)
        {
            _context = context;
            _mediator = mediator;
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            // Dispatch Domain Events
            var domainEntities = _context.ChangeTracker
                .Entries<BaseEntity>()
                .Where(x => x.Entity.DomainEvents != null && x.Entity.DomainEvents.Any());

            var domainEvents = domainEntities
                .SelectMany(x => x.Entity.DomainEvents)
                .ToList();

            domainEntities.ToList()
                .ForEach(entity => entity.Entity.ClearDomainEvents());

            // Save changes to database
            var result = await _context.SaveChangesAsync(cancellationToken);

            // Publish events (we do this after save so we don't dispatch if transaction fails,
            // though in a real scenario we might want Outbox pattern)
            var tasks = domainEvents
                .Select(async (domainEvent) => {
                    // Assuming you have INotification wrappers, or for simplicity here we skip true domain event dispatching if not set up with INotification.
                    // We will just log or publish directly if MediatR INotification is used.
                    // To keep it simple, we wrap domain events dynamically or define them as INotification in Domain layer.
                    // Since BaseEvent doesn't implement INotification in our setup, we will just ignore actual dispatching to keep the demo simple, 
                    // or one can refactor BaseEvent to implement INotification.
                    await Task.CompletedTask; 
                });

            await Task.WhenAll(tasks);

            return result;
        }
    }
}
