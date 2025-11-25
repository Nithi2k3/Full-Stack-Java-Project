package Code.Project.HospitalSelectioSystem.model;

import jakarta.persistence.*;

@Entity
@Table(name = "hospitals")
public class Hospital {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String area;
    private String address;
    private String city;
    private Long contactno;


    private int totalBeds;
    private int availableBeds;
    private boolean oxygenAvailable;
    private boolean ventilatorAvailable;
    private boolean ambulanceAvailable;
    private boolean open24Hours;
    private int availableDoctors;

    public void setId(Long id){
        this.id = id;
    }

    public Long getId(){
        return id;
    }

    public Long getContactno(){
        return contactno;
    }

    public void setContactno(Long contactno){
        this.contactno = contactno;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public int getTotalBeds() {
        return totalBeds;
    }

    public void setTotalBeds(int totalBeds) {
        this.totalBeds = totalBeds;
    }

    public boolean isOpen24Hours() {
        return open24Hours;
    }

    public void setOpen24Hours(boolean open24Hours) {
        this.open24Hours = open24Hours;
    }

    public int getAvailableBeds() {
        return availableBeds;
    }

    public void setAvailableBeds(int availableBeds) {
        this.availableBeds = availableBeds;
    }

    public int getAvailableDoctors() {
        return availableDoctors;
    }

    public void setAvailableDoctors(int availableDoctors) {
        this.availableDoctors = availableDoctors;
    }

    public boolean isAmbulanceAvailable() {
        return ambulanceAvailable;
    }

    public void setAmbulanceAvailable(boolean ambulanceAvailable) {
        this.ambulanceAvailable = ambulanceAvailable;
    }

    public boolean isOxygenAvailable() {
        return oxygenAvailable;
    }

    public void setOxygenAvailable(boolean oxygenAvailable) {
        this.oxygenAvailable = oxygenAvailable;
    }

    public boolean isVentilatorAvailable() {
        return ventilatorAvailable;
    }

    public void setVentilatorAvailable(boolean ventilatorAvailable) {
        this.ventilatorAvailable = ventilatorAvailable;
    }
}
