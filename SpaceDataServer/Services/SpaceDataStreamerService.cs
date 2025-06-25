using Grpc.Core;
using System.Text.Json;
using SpaceDataServer.Protos;
using System;
using ConnectionInfo = SpaceDataServer.Models.ConnectionInfo;
namespace SpaceDataServer.Services 
{
    
    public class SpaceDataStreamerService : SpaceDataStreamer.SpaceDataStreamerBase
    {
        private static readonly Dictionary<string, IServerStreamWriter<SpaceDataResponse>> _streams = new();
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IServiceProvider _serviceProvider;

        public SpaceDataStreamerService(IHttpClientFactory httpClientFactory, IServiceProvider serviceProvider)
        {
            _httpClientFactory = httpClientFactory;
            _serviceProvider = serviceProvider;
        }

        public override async Task GetSpaceData(SpaceDataRequest request,
            IServerStreamWriter<SpaceDataResponse> responseStream,
            ServerCallContext context)
        {
            var httpClient = _httpClientFactory.CreateClient();
            var connectionId = request.ConnectionId;
            _streams[connectionId] = responseStream;

            using (var scope = _serviceProvider.CreateScope())
                {
                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    db.Connections.Add(new ConnectionInfo { ConnectionId = connectionId });
                    db.SaveChanges();
                }

            while (!context.CancellationToken.IsCancellationRequested)
            {
                try
                {
                    var response = await httpClient.GetStringAsync(
                        "https://api.wheretheiss.at/v1/satellites/25544");

                    var issData = JsonSerializer.Deserialize<JsonElement>(response);
                    double value = request.DataType switch
                    {
                        "altitude" => issData.GetProperty("altitude").GetDouble(),
                        "velocity" => issData.GetProperty("velocity").GetDouble(),
                        _ => issData.GetProperty("latitude").GetDouble()
                    };

                    await responseStream.WriteAsync(new SpaceDataResponse
                    {
                        Value = value,
                        MeasurementTime = DateTime.UtcNow.ToString("o"),
                        DataType = request.DataType
                    });

                    await Task.Delay(500);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Hata oluştu: {ex.Message}");
                    await Task.Delay(5000);
                }
                finally
                {
                    _streams.Remove(connectionId);
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                        var entity = db.Connections.FirstOrDefault(x => x.ConnectionId == connectionId);
                        if (entity != null)
                        {
                            db.Connections.Remove(entity);
                            db.SaveChanges();
                        }
                    }
                }
            }
        }
    }
}