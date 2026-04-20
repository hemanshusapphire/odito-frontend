export default function AboutTeam() {
  const team = [
    {
      name: "Alex Rivera",
      role: "Lead Architect",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7_EIETvyjCS4QC2LP3rq_EGCu6Di94SzCVTJvR4scTbbBrejGadK1nOgXBreQzRNCD-V_0fzwDZIIIZU1cZMSPpdQYywEN3TQx1YaRt2QdQvHi1XT8v7XgXjfPot9gI52Yl4IPm_ZyjltHsobFZuHZ_hRU4MGPmikXKVLelzbj2xHFVmC0Br3g4wLh3S9-PqBmNkxsmWVU75PODa0YATSvffK_a1I38_WoLw1yfxCDs6El8nPWQ3eXoRBdKroNT885baR4zS4zv0",
    },
    {
      name: "Elena Vance",
      role: "SEO Strategy",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfxa6EFGmh5-qAcMpKu0DQROrIheBrvS42UL06uZ--EsdEu0z76FhpvpOrI8zx-wY1bx7Wakb4klj3Yk_BiD_uYPKybfV_0pKcajgObANQ5NALx7RIt1Fo1UjWfaA8TPpIulX4Qnii-AahRdyh4s9fOsoXQWhkaMrkuhQxEpQzIwBFzUkC4m2y3tdr2gBKztqxWvGrqQlprtzJnrJr0sCsl-dYWAOY0CKYvN9ya52mj7HNi62-eVTLoVmdHiMGe0t8W27y8VWxuB4",
    },
    {
      name: "Marcus Chen",
      role: "Data Scientist",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAA_3WzIQNDBZruDoXL5Q2MNcq_eN26ZydAg5SpfrMwrB1qDrAfzMhKTg_q5LY7yLZWimoqsSbRIHi83886L7wCjC35V760ekRmwgn25M7nrxkKTBr9fin-ELtkqzT7Pic4blvb1BRaeNJWcHDsM-yVXCOJVlgVcmbaspYMU3IJYC_OO9H6bUFa2S5UMkEteW5eItx7LBslCIfiHuYNUAPLjUHoetApRA106nyj9phKEPJbRL0f-FeLLJSSn_kRkLe6B-FM8BoEey0",
    },
    {
      name: "Sarah Bloom",
      role: "Product Design",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVsInCUgKUJTJeZwSM-F5olhs92I1014g29-HLVY5fiIONIe50vFpYhMlAURwEFk9dChY9myubV67Tp2QId7V2iQSxijp80hUTXHiVrin3kxdweGfwPCwCpfoBbnWaBTveF8ScmfY8YenoNltHHaQks8sDV-41adm9YIftgN_VOU4uf80iGyl3PkSsrEk9fq2GKbgKynenA-1JhCMqtTF9poyz51yAmtWyBQJXS9j64puWL1DbX5UJ1llGn6waXh8esq7uVoH59j8",
    },
  ]

  return (
    <section className="py-32 px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div>
          <h2 className="text-4xl font-bold mb-4 text-white">The Minds Behind Odito</h2>
          <p className="text-on-surface-variant">A global collective of engineers and strategists.</p>
        </div>
        <button className="text-primary font-bold hover:underline">View open positions</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {team.map((member, index) => (
          <div key={index} className="group">
            <div className="aspect-square overflow-hidden rounded-2xl mb-6 bg-surface-container-high border border-outline-variant/20">
              <img
                alt={member.name}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                src={member.image}
              />
            </div>
            <h5 className="text-xl font-bold text-white">{member.name}</h5>
            <p className="text-primary text-sm font-medium">{member.role}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
